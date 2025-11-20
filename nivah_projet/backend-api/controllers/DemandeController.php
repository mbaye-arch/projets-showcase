<?php
/**
 * DemandeController - Gestion des demandes clients (Support/SAV)
 */

require_once __DIR__ . '/../models/Demande.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../core/Mailer.php';

class DemandeController {
    private $db;

    // Types de demandes autorisés
    const TYPES = [
        'support' => 'Support technique',
        'reclamation' => 'Réclamation',
        'question_produit' => 'Question produit',
        'question_livraison' => 'Question livraison',
        'remboursement' => 'Remboursement',
        'retour_echange' => 'Retour/Échange',
        'autre' => 'Autre'
    ];

    // Statuts autorisés
    const STATUTS = [
        'nouveau' => 'Nouveau',
        'en_attente' => 'En attente',
        'en_cours' => 'En cours',
        'en_attente_client' => 'En attente client',
        'resolu' => 'Résolu',
        'clos' => 'Clos',
        'annule' => 'Annulé'
    ];

    // Priorités
    const PRIORITES = [
        'basse' => 'Basse',
        'normale' => 'Normale',
        'haute' => 'Haute',
        'urgente' => 'Urgente'
    ];

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * GET /demandes - Liste des demandes du client
     */
    public function index($user) {
        $clientId = $user['client_id'];

        // Pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        // Filtres
        $statut = isset($_GET['statut']) ? $_GET['statut'] : null;
        $type = isset($_GET['type']) ? $_GET['type'] : null;

        // Construire la requête
        $sql = "SELECT * FROM demandes_clients WHERE client_id = ?";
        $params = [$clientId];

        if ($statut) {
            $sql .= " AND statut = ?";
            $params[] = $statut;
        }

        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }

        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        // Exécuter
        $demandes = $this->db->query($sql, $params);

        // Formater les résultats
        $formatted = array_map(function($demande) {
            return $this->formatDemande($demande);
        }, $demandes);

        // Compter le total
        $countSql = "SELECT COUNT(*) as total FROM demandes_clients WHERE client_id = ?";
        $countParams = [$clientId];

        if ($statut) {
            $countSql .= " AND statut = ?";
            $countParams[] = $statut;
        }

        if ($type) {
            $countSql .= " AND type = ?";
            $countParams[] = $type;
        }

        $totalResult = $this->db->queryOne($countSql, $countParams);
        $total = $totalResult['total'];

        Response::success([
            'demandes' => $formatted,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * POST /demandes - Créer une nouvelle demande
     */
    public function create($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['type', 'sujet', 'message']);
        if ($errors) {
            Response::validationError($errors);
        }

        // Vérifier le type
        if (!isset(self::TYPES[$data['type']])) {
            Response::error("Type de demande invalide", 400);
        }

        // Vérifier la limite (5 demandes/jour)
        $count = $this->db->queryOne(
            "SELECT COUNT(*) as count FROM demandes_clients
             WHERE client_id = ? AND DATE(created_at) = CURDATE()",
            [$clientId]
        );

        if ($count['count'] >= 5) {
            Response::error("Vous avez atteint la limite de 5 demandes par jour", 429);
        }

        // Déterminer la priorité
        $priorite = isset($data['priorite']) ? $data['priorite'] : 'normale';
        if (!isset(self::PRIORITES[$priorite])) {
            $priorite = 'normale';
        }

        // Priorité automatique pour certains types
        if ($data['type'] === 'remboursement') {
            $priorite = 'urgente';
        } elseif (in_array($data['type'], ['reclamation', 'retour_echange'])) {
            $priorite = 'haute';
        }

        try {
            // Insérer la demande (le trigger va générer le numéro automatiquement)
            $sql = "INSERT INTO demandes_clients
                    (client_id, type, sujet, message, commande_id, produit_id, priorite, statut, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'nouveau', NOW(), NOW())";

            $this->db->execute($sql, [
                $clientId,
                $data['type'],
                $data['sujet'],
                $data['message'],
                isset($data['commande_id']) ? $data['commande_id'] : null,
                isset($data['produit_id']) ? $data['produit_id'] : null,
                $priorite
            ]);

            $demandeId = $this->db->lastInsertId();

            // Récupérer la demande créée (avec le numéro généré)
            $demande = $this->db->queryOne(
                "SELECT * FROM demandes_clients WHERE id = ?",
                [$demandeId]
            );

            // Récupérer les infos du client
            $clientModel = new Client();
            $client = $clientModel->find($clientId);

            // Envoyer l'email de confirmation
            Mailer::sendSupportRequestConfirmation($demande, $client);

            Response::success(
                $this->formatDemande($demande),
                "Demande créée avec succès. Un email de confirmation vous a été envoyé. Numéro: " . $demande['numero'],
                201
            );

        } catch (Exception $e) {
            error_log("Erreur création demande: " . $e->getMessage());
            Response::serverError("Erreur lors de la création de la demande");
        }
    }

    /**
     * GET /demandes/{numero} - Détails d'une demande
     */
    public function show($user, $numero) {
        $clientId = $user['client_id'];

        $demande = $this->db->queryOne(
            "SELECT * FROM demandes_clients WHERE numero = ? AND client_id = ?",
            [$numero, $clientId]
        );

        if (!$demande) {
            Response::notFound("Demande introuvable");
        }

        // Récupérer la commande si liée
        $commande = null;
        if ($demande['commande_id']) {
            $commande = $this->db->queryOne(
                "SELECT numero, total, date_commande FROM commandes WHERE id = ?",
                [$demande['commande_id']]
            );
        }

        // Récupérer le produit si lié
        $produit = null;
        if ($demande['produit_id']) {
            $produit = $this->db->queryOne(
                "SELECT id, nom, slug, prix FROM produits WHERE id = ?",
                [$demande['produit_id']]
            );
        }

        // Formater
        $formatted = $this->formatDemande($demande);
        $formatted['commande'] = $commande;
        $formatted['produit'] = $produit;

        // Calculer temps écoulé
        $formatted['temps_ecoule'] = $this->calculateTimeElapsed($demande['created_at']);

        // Vérifier SLA
        $formatted['sla_respecte'] = $this->checkSLA($demande);

        Response::success($formatted);
    }

    /**
     * PUT /demandes/{id}/annuler - Annuler une demande
     */
    public function cancel($user, $demandeId) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Vérifier que la demande appartient au client
        $demande = $this->db->queryOne(
            "SELECT * FROM demandes_clients WHERE id = ? AND client_id = ?",
            [$demandeId, $clientId]
        );

        if (!$demande) {
            Response::notFound("Demande introuvable");
        }

        // Vérifier que la demande peut être annulée
        if (in_array($demande['statut'], ['resolu', 'clos', 'annule'])) {
            Response::error("Cette demande ne peut plus être annulée", 400);
        }

        // Mettre à jour
        $this->db->execute(
            "UPDATE demandes_clients SET statut = 'annule', updated_at = NOW() WHERE id = ?",
            [$demandeId]
        );

        Response::success(null, "Demande annulée avec succès");
    }

    /**
     * GET /demandes/statistiques - Statistiques personnelles
     */
    public function stats($user) {
        $clientId = $user['client_id'];

        // Utiliser la procédure stockée
        $stats = $this->db->queryOne(
            "CALL get_client_demandes_stats(?)",
            [$clientId]
        );

        if (!$stats) {
            Response::success([
                'total_demandes' => 0,
                'en_attente' => 0,
                'en_cours' => 0,
                'resolues' => 0,
                'annulees' => 0
            ]);
        }

        // Formater temps moyen
        $stats['temps_moyen_premiere_reponse'] = $this->formatMinutes($stats['temps_moyen_premiere_reponse']);
        $stats['temps_moyen_resolution'] = $this->formatMinutes($stats['temps_moyen_resolution']);

        Response::success($stats);
    }

    /**
     * GET /demandes/types - Liste des types de demandes
     */
    public function types() {
        $types = [];
        foreach (self::TYPES as $key => $label) {
            $types[] = [
                'code' => $key,
                'label' => $label
            ];
        }

        Response::success([
            'types' => $types,
            'statuts' => $this->getStatutsList(),
            'priorites' => $this->getPrioritesList()
        ]);
    }

    /**
     * Formater une demande
     */
    private function formatDemande($demande) {
        return [
            'id' => (int)$demande['id'],
            'numero' => $demande['numero'],
            'type' => $demande['type'],
            'type_label' => self::TYPES[$demande['type']] ?? $demande['type'],
            'sujet' => $demande['sujet'],
            'message' => $demande['message'],
            'statut' => $demande['statut'],
            'statut_label' => self::STATUTS[$demande['statut']] ?? $demande['statut'],
            'priorite' => $demande['priorite'],
            'priorite_label' => self::PRIORITES[$demande['priorite']] ?? $demande['priorite'],
            'created_at' => $demande['created_at'],
            'updated_at' => $demande['updated_at']
        ];
    }

    /**
     * Calculer le temps écoulé depuis la création
     */
    private function calculateTimeElapsed($createdAt) {
        $created = new DateTime($createdAt);
        $now = new DateTime();
        $diff = $now->diff($created);

        if ($diff->days > 0) {
            return $diff->days . ' jour' . ($diff->days > 1 ? 's' : '');
        } elseif ($diff->h > 0) {
            return $diff->h . 'h' . ($diff->i > 0 ? $diff->i . 'min' : '');
        } else {
            return $diff->i . ' min';
        }
    }

    /**
     * Vérifier si le SLA est respecté
     */
    private function checkSLA($demande) {
        if ($demande['statut'] === 'resolu' || $demande['statut'] === 'clos') {
            return true;
        }

        $now = time();

        // Vérifier SLA première réponse
        if ($demande['sla_premiere_reponse'] && !$demande['temps_premiere_reponse']) {
            $slaTime = strtotime($demande['sla_premiere_reponse']);
            if ($now > $slaTime) {
                return false;
            }
        }

        // Vérifier SLA résolution
        if ($demande['sla_resolution']) {
            $slaTime = strtotime($demande['sla_resolution']);
            if ($now > $slaTime) {
                return false;
            }
        }

        return true;
    }

    /**
     * Formater les minutes en texte lisible
     */
    private function formatMinutes($minutes) {
        if (!$minutes) {
            return null;
        }

        $minutes = (int)$minutes;

        if ($minutes < 60) {
            return $minutes . ' min';
        }

        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        if ($hours < 24) {
            return $hours . 'h' . ($mins > 0 ? $mins . 'min' : '');
        }

        $days = floor($hours / 24);
        $hours = $hours % 24;

        return $days . 'j' . ($hours > 0 ? ' ' . $hours . 'h' : '');
    }

    /**
     * Liste des statuts
     */
    private function getStatutsList() {
        $list = [];
        foreach (self::STATUTS as $key => $label) {
            $list[] = ['code' => $key, 'label' => $label];
        }
        return $list;
    }

    /**
     * Liste des priorités
     */
    private function getPrioritesList() {
        $list = [];
        foreach (self::PRIORITES as $key => $label) {
            $list[] = ['code' => $key, 'label' => $label];
        }
        return $list;
    }
}

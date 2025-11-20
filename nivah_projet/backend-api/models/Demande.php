<?php
/**
 * Modèle Demande (Support/SAV)
 */

class Demande {
    private $db;

    const TYPES = [
        'support' => 'Support technique',
        'reclamation' => 'Réclamation',
        'question_produit' => 'Question produit',
        'question_livraison' => 'Question livraison',
        'remboursement' => 'Remboursement',
        'retour_echange' => 'Retour/Échange',
        'autre' => 'Autre'
    ];

    const STATUTS = [
        'nouveau' => 'Nouveau',
        'en_attente' => 'En attente',
        'en_cours' => 'En cours',
        'en_attente_client' => 'En attente client',
        'resolu' => 'Résolu',
        'clos' => 'Clos',
        'annule' => 'Annulé'
    ];

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
     * Trouver une demande par ID
     */
    public function find($id) {
        return $this->db->queryOne(
            "SELECT * FROM demandes_clients WHERE id = ?",
            [$id]
        );
    }

    /**
     * Trouver une demande par numéro
     */
    public function findByNumero($numero) {
        return $this->db->queryOne(
            "SELECT * FROM demandes_clients WHERE numero = ?",
            [$numero]
        );
    }

    /**
     * Lister les demandes d'un client
     */
    public function getByClient($clientId, $filters = [], $limit = 20, $offset = 0) {
        $sql = "SELECT * FROM demandes_clients WHERE client_id = ?";
        $params = [$clientId];

        if (isset($filters['statut'])) {
            $sql .= " AND statut = ?";
            $params[] = $filters['statut'];
        }

        if (isset($filters['type'])) {
            $sql .= " AND type = ?";
            $params[] = $filters['type'];
        }

        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->query($sql, $params);
    }

    /**
     * Compter les demandes d'un client
     */
    public function countByClient($clientId, $filters = []) {
        $sql = "SELECT COUNT(*) as total FROM demandes_clients WHERE client_id = ?";
        $params = [$clientId];

        if (isset($filters['statut'])) {
            $sql .= " AND statut = ?";
            $params[] = $filters['statut'];
        }

        if (isset($filters['type'])) {
            $sql .= " AND type = ?";
            $params[] = $filters['type'];
        }

        $result = $this->db->queryOne($sql, $params);
        return $result['total'];
    }

    /**
     * Créer une demande
     */
    public function create($clientId, $data) {
        // Vérifier la limite quotidienne (5 demandes/jour)
        $count = $this->db->queryOne(
            "SELECT COUNT(*) as count FROM demandes_clients
             WHERE client_id = ? AND DATE(created_at) = CURDATE()",
            [$clientId]
        );

        if ($count['count'] >= 5) {
            throw new Exception("Limite de 5 demandes par jour atteinte");
        }

        // Déterminer la priorité automatique
        $priorite = $data['priorite'] ?? 'normale';

        if ($data['type'] === 'remboursement') {
            $priorite = 'urgente';
        } elseif (in_array($data['type'], ['reclamation', 'retour_echange'])) {
            $priorite = 'haute';
        }

        $sql = "INSERT INTO demandes_clients (
            client_id, type, sujet, message,
            commande_id, produit_id,
            priorite, statut,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'nouveau', NOW(), NOW())";

        $this->db->execute($sql, [
            $clientId,
            $data['type'],
            $data['sujet'],
            $data['message'],
            $data['commande_id'] ?? null,
            $data['produit_id'] ?? null,
            $priorite
        ]);

        $demandeId = $this->db->lastInsertId();

        // Récupérer la demande créée (avec numéro auto-généré)
        return $this->find($demandeId);
    }

    /**
     * Mettre à jour une demande
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }

        $values[] = $id;

        $sql = "UPDATE demandes_clients SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, $values);
    }

    /**
     * Mettre à jour le statut
     */
    public function updateStatut($id, $nouveauStatut) {
        if (!isset(self::STATUTS[$nouveauStatut])) {
            throw new Exception("Statut invalide");
        }

        return $this->db->execute(
            "UPDATE demandes_clients SET statut = ?, updated_at = NOW() WHERE id = ?",
            [$nouveauStatut, $id]
        );
    }

    /**
     * Annuler une demande
     */
    public function cancel($id, $clientId, $raison = null) {
        $demande = $this->find($id);

        if (!$demande || $demande['client_id'] != $clientId) {
            throw new Exception("Demande introuvable");
        }

        // Vérifier si la demande peut être annulée
        if (in_array($demande['statut'], ['resolu', 'clos', 'annule'])) {
            throw new Exception("Cette demande ne peut plus être annulée");
        }

        return $this->db->execute(
            "UPDATE demandes_clients SET statut = 'annule', updated_at = NOW() WHERE id = ?",
            [$id]
        );
    }

    /**
     * Obtenir les statistiques d'un client
     */
    public function getClientStats($clientId) {
        // Utiliser la procédure stockée si disponible
        try {
            $stats = $this->db->queryOne(
                "CALL get_client_demandes_stats(?)",
                [$clientId]
            );

            if ($stats) {
                return $stats;
            }
        } catch (Exception $e) {
            // Si la procédure n'existe pas, faire une requête manuelle
        }

        // Fallback: Requête manuelle
        $stats = $this->db->queryOne(
            "SELECT
                COUNT(*) as total_demandes,
                SUM(CASE WHEN statut IN ('nouveau', 'en_attente') THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut IN ('en_cours', 'en_attente_client') THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut IN ('resolu', 'clos') THEN 1 ELSE 0 END) as resolues,
                SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) as annulees,
                AVG(temps_premiere_reponse) as temps_moyen_premiere_reponse,
                AVG(temps_resolution) as temps_moyen_resolution,
                AVG(satisfaction_note) as note_moyenne_satisfaction
             FROM demandes_clients
             WHERE client_id = ?",
            [$clientId]
        );

        return $stats;
    }

    /**
     * Vérifier le SLA
     */
    public function checkSLA($demande) {
        if ($demande['statut'] === 'resolu' || $demande['statut'] === 'clos') {
            return true;
        }

        $now = time();

        // SLA première réponse
        if ($demande['sla_premiere_reponse'] && !$demande['temps_premiere_reponse']) {
            if ($now > strtotime($demande['sla_premiere_reponse'])) {
                return false;
            }
        }

        // SLA résolution
        if ($demande['sla_resolution']) {
            if ($now > strtotime($demande['sla_resolution'])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtenir les demandes en retard (SLA dépassé)
     */
    public function getOverdueDemands() {
        return $this->db->query(
            "SELECT * FROM demandes_clients
             WHERE statut NOT IN ('resolu', 'clos', 'annule')
               AND (
                   (sla_premiere_reponse < NOW() AND temps_premiere_reponse IS NULL)
                   OR
                   (sla_resolution < NOW() AND statut NOT IN ('resolu', 'clos'))
               )
             ORDER BY priorite DESC, created_at ASC"
        );
    }

    /**
     * Ajouter une note de satisfaction
     */
    public function addSatisfaction($id, $note, $commentaire = null) {
        if ($note < 1 || $note > 5) {
            throw new Exception("La note doit être entre 1 et 5");
        }

        return $this->db->execute(
            "UPDATE demandes_clients
             SET satisfaction_note = ?, satisfaction_commentaire = ?, updated_at = NOW()
             WHERE id = ?",
            [$note, $commentaire, $id]
        );
    }

    /**
     * Auto-fermer les demandes inactives
     */
    public static function autoCloseDemands() {
        $db = Database::getInstance();

        try {
            // Appeler la procédure stockée
            $result = $db->queryOne("CALL auto_close_inactive_demandes()");
            return $result['demandes_fermees'];
        } catch (Exception $e) {
            // Fallback
            $result = $db->execute(
                "UPDATE demandes_clients
                 SET statut = 'clos', updated_at = NOW()
                 WHERE statut = 'en_attente_client'
                   AND updated_at < DATE_SUB(NOW(), INTERVAL 15 DAY)"
            );

            return $result;
        }
    }

    /**
     * Rechercher des demandes
     */
    public function search($query, $filters = [], $limit = 20, $offset = 0) {
        $sql = "SELECT d.*, c.nom, c.prenom, c.email
                FROM demandes_clients d
                JOIN clients c ON d.client_id = c.id
                WHERE (d.numero LIKE ? OR d.sujet LIKE ? OR d.message LIKE ?)";

        $searchTerm = "%$query%";
        $params = [$searchTerm, $searchTerm, $searchTerm];

        if (isset($filters['statut'])) {
            $sql .= " AND d.statut = ?";
            $params[] = $filters['statut'];
        }

        if (isset($filters['type'])) {
            $sql .= " AND d.type = ?";
            $params[] = $filters['type'];
        }

        $sql .= " ORDER BY d.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->query($sql, $params);
    }
}

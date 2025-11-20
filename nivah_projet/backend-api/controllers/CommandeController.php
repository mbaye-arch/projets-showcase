<?php
/**
 * CommandeController - Gestion des commandes
 */

require_once __DIR__ . '/../models/Commande.php';
require_once __DIR__ . '/../models/Panier.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../core/Mailer.php';
require_once __DIR__ . '/../core/PaydunyaService.php';

class CommandeController {
    private $commandeModel;
    private $panierModel;

    public function __construct() {
        $this->commandeModel = new Commande();
        $this->panierModel = new Panier();
    }

    /**
     * GET /commandes - Liste des commandes du client
     */
    public function index($user) {
        $clientId = $user['client_id'];

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $filters = [];
        if (isset($_GET['statut'])) {
            $filters['statut'] = $_GET['statut'];
        }

        $commandes = $this->commandeModel->getByClient($clientId, $filters, $limit, $offset);
        $total = $this->commandeModel->countByClient($clientId, $filters);

        Response::success([
            'commandes' => $commandes,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * POST /commandes - Créer une commande depuis le panier
     */
    public function create($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['adresse_livraison']);
        if ($errors) {
            Response::validationError($errors);
        }

        // Récupérer le panier actif
        $panier = $this->panierModel->getActiveCart($clientId);

        if (!$panier) {
            Response::error("Votre panier est vide", 400);
        }

        // Vérifier que le panier contient des articles
        $items = $this->panierModel->getItems($panier['id']);
        if (empty($items)) {
            Response::error("Votre panier est vide", 400);
        }

        // Valider le stock
        $stockErrors = $this->panierModel->validateStock($panier['id']);
        if (!empty($stockErrors)) {
            Response::error("Stock insuffisant pour certains produits", 400, $stockErrors);
        }

        try {
            // Créer la commande
            $commande = $this->commandeModel->createFromCart($clientId, $panier['id'], $data);

            // Récupérer les articles de la commande
            $commandeItems = $this->commandeModel->getItems($commande['id']);

            // Récupérer les infos du client
            $clientModel = new Client();
            $client = $clientModel->find($clientId);

            $responseData = [
                'commande' => $commande,
                'articles' => $commandeItems,
                'message' => 'Commande créée avec succès'
            ];

            // Si paiement en ligne (Paydunya), générer l'URL de paiement
            if (isset($data['mode_paiement']) && $data['mode_paiement'] === 'paydunya') {
                try {
                    $paydunyaService = new PaydunyaService();
                    $paymentData = $paydunyaService->createInvoice($commande, $client);

                    // Sauvegarder le token Paydunya
                    $db = Database::getInstance();
                    $db->execute(
                        "UPDATE commandes SET paydunya_token = ?, updated_at = NOW() WHERE id = ?",
                        [$paymentData['token'], $commande['id']]
                    );

                    $responseData['payment'] = [
                        'provider' => 'paydunya',
                        'checkout_url' => PaydunyaService::getCheckoutUrl($paymentData['token']),
                        'token' => $paymentData['token']
                    ];

                    Response::success(
                        $responseData,
                        'Commande créée avec succès. Veuillez procéder au paiement. Numéro: ' . $commande['numero_commande'],
                        201
                    );

                } catch (Exception $e) {
                    error_log("Erreur Paydunya: " . $e->getMessage());

                    // La commande est créée mais le paiement a échoué
                    Response::success(
                        $responseData,
                        'Commande créée mais erreur lors de l\'initialisation du paiement. Veuillez réessayer.',
                        201
                    );
                }
            } else {
                // Paiement à la livraison ou autre
                // Envoyer l'email de confirmation
                Mailer::sendOrderConfirmation($commande, $client);

                Response::success(
                    $responseData,
                    'Commande créée avec succès. Un email de confirmation vous a été envoyé. Numéro: ' . $commande['numero_commande'],
                    201
                );
            }

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la création de la commande: " . $e->getMessage());
        }
    }

    /**
     * GET /commandes/{numero} - Détails d'une commande
     */
    public function show($user, $numero) {
        $clientId = $user['client_id'];

        $commande = $this->commandeModel->findByNumero($numero);

        if (!$commande) {
            Response::notFound("Commande introuvable");
        }

        // Vérifier que la commande appartient au client
        if ($commande['client_id'] != $clientId) {
            Response::forbidden("Accès interdit à cette commande");
        }

        // Récupérer les articles
        $items = $this->commandeModel->getItems($commande['id']);

        Response::success([
            'commande' => $commande,
            'articles' => $items
        ]);
    }

    /**
     * PUT /commandes/{id}/annuler - Annuler une commande
     */
    public function annuler($user, $commandeId) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        $raison = isset($data['raison']) ? $data['raison'] : null;

        try {
            $this->commandeModel->cancel($commandeId, $clientId, $raison);

            Response::success(null, 'Commande annulée avec succès');

        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * GET /commandes/{id}/tracking - Suivi de livraison
     */
    public function tracking($user, $commandeId) {
        $clientId = $user['client_id'];

        $commande = $this->commandeModel->find($commandeId);

        if (!$commande) {
            Response::notFound("Commande introuvable");
        }

        if ($commande['client_id'] != $clientId) {
            Response::forbidden("Accès interdit à cette commande");
        }

        // Timeline des statuts
        $timeline = [
            'en_attente' => [
                'label' => 'En attente',
                'date' => $commande['created_at'],
                'completed' => true
            ],
            'confirmee' => [
                'label' => 'Confirmée',
                'date' => null,
                'completed' => in_array($commande['statut'], ['confirmee', 'en_preparation', 'expedie', 'en_livraison', 'livree'])
            ],
            'en_preparation' => [
                'label' => 'En préparation',
                'date' => null,
                'completed' => in_array($commande['statut'], ['en_preparation', 'expedie', 'en_livraison', 'livree'])
            ],
            'expedie' => [
                'label' => 'Expédiée',
                'date' => null,
                'completed' => in_array($commande['statut'], ['expedie', 'en_livraison', 'livree'])
            ],
            'en_livraison' => [
                'label' => 'En livraison',
                'date' => null,
                'completed' => in_array($commande['statut'], ['en_livraison', 'livree'])
            ],
            'livree' => [
                'label' => 'Livrée',
                'date' => null,
                'completed' => $commande['statut'] === 'livree'
            ]
        ];

        Response::success([
            'commande' => [
                'numero' => $commande['numero_commande'], // CORRECTION: colonne numero_commande
                'statut' => $commande['statut'],
                'statut_label' => ucfirst(str_replace('_', ' ', $commande['statut'])),
                'numero_tracking' => $commande['numero_tracking'] ?? null // CORRECTION: colonne numero_tracking
            ],
            'timeline' => $timeline,
            'peut_annuler' => in_array($commande['statut'], ['en_attente', 'confirmee'])
        ]);
    }

    /**
     * GET /commandes/statistiques - Statistiques des commandes du client
     */
    public function statistiques($user) {
        $clientId = $user['client_id'];

        $stats = $this->commandeModel->getClientStats($clientId);

        Response::success($stats);
    }

    /**
     * GET /commandes/{id}/facture - Télécharger la facture (TODO)
     */
    public function facture($user, $commandeId) {
        $clientId = $user['client_id'];

        $commande = $this->commandeModel->find($commandeId);

        if (!$commande || $commande['client_id'] != $clientId) {
            Response::notFound("Commande introuvable");
        }

        // TODO: Générer PDF de la facture
        Response::success([
            'message' => 'Génération de facture à implémenter',
            'commande_numero' => $commande['numero_commande'] // CORRECTION: colonne numero_commande
        ]);
    }
}

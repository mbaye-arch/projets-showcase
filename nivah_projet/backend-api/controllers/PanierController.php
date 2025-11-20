<?php
/**
 * PanierController - Gestion du panier
 */

require_once __DIR__ . '/../models/Panier.php';
require_once __DIR__ . '/../models/Produit.php';

class PanierController {
    private $panierModel;
    private $produitModel;

    public function __construct() {
        $this->panierModel = new Panier();
        $this->produitModel = new Produit();
    }

    /**
     * GET /panier - Obtenir le panier du client
     */
    public function index($user) {
        $clientId = $user['client_id'];

        // Obtenir ou créer le panier
        $panier = $this->panierModel->getOrCreate($clientId);

        // Récupérer les articles
        $items = $this->panierModel->getItems($panier['id']);

        // Calculer les totaux
        $totaux = $this->panierModel->calculateTotal($panier['id']);

        // Compter les articles
        $counts = $this->panierModel->countItems($panier['id']);

        Response::success([
            'panier' => [
                'id' => $panier['id'],
                'statut' => $panier['statut'],
                'created_at' => $panier['created_at']
            ],
            'articles' => $items,
            'totaux' => $totaux,
            'nombre_articles' => $counts['nombre_articles'],
            'quantite_totale' => $counts['quantite_totale']
        ]);
    }

    /**
     * POST /panier/ajouter - Ajouter un article au panier
     */
    public function ajouter($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['produit_id', 'quantite']);
        if ($errors) {
            Response::validationError($errors);
        }

        $produitId = (int)$data['produit_id'];
        $quantite = (int)$data['quantite'];
        $varianteId = isset($data['variante_id']) ? (int)$data['variante_id'] : null;

        // Vérifier que la quantité est positive
        if ($quantite <= 0) {
            Response::error("La quantité doit être supérieure à 0", 400);
        }

        // Vérifier que le produit existe
        $produit = $this->produitModel->find($produitId);
        if (!$produit) {
            Response::notFound("Produit introuvable");
        }

        // Vérifier que le produit est disponible
        if ($produit['statut'] !== 'actif' || !$produit['est_visible']) {
            Response::error("Ce produit n'est plus disponible", 400);
        }

        // Vérifier le stock
        if (!$this->produitModel->checkStock($produitId, $quantite)) {
            Response::error("Stock insuffisant pour ce produit", 400);
        }

        try {
            // Obtenir ou créer le panier
            $panier = $this->panierModel->getOrCreate($clientId);

            // Ajouter l'article
            $this->panierModel->addItem($panier['id'], $produitId, $quantite, $varianteId);

            // Récupérer le panier mis à jour
            $items = $this->panierModel->getItems($panier['id']);
            $totaux = $this->panierModel->calculateTotal($panier['id']);
            $counts = $this->panierModel->countItems($panier['id']);

            Response::success([
                'message' => 'Article ajouté au panier',
                'panier' => [
                    'id' => $panier['id'],
                    'articles' => $items,
                    'totaux' => $totaux,
                    'nombre_articles' => $counts['nombre_articles']
                ]
            ], 'Article ajouté au panier avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de l'ajout au panier: " . $e->getMessage());
        }
    }

    /**
     * PUT /panier/article/{id} - Modifier la quantité d'un article
     */
    public function updateQuantite($user, $articleId) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['quantite']);
        if ($errors) {
            Response::validationError($errors);
        }

        $quantite = (int)$data['quantite'];

        // Vérifier que l'article appartient au client
        $panier = $this->panierModel->getActiveCart($clientId);
        if (!$panier) {
            Response::notFound("Panier introuvable");
        }

        try {
            // Mettre à jour la quantité
            $this->panierModel->updateItemQuantity($articleId, $quantite);

            // Récupérer le panier mis à jour
            $items = $this->panierModel->getItems($panier['id']);
            $totaux = $this->panierModel->calculateTotal($panier['id']);

            Response::success([
                'message' => 'Quantité mise à jour',
                'articles' => $items,
                'totaux' => $totaux
            ], 'Quantité mise à jour avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la mise à jour: " . $e->getMessage());
        }
    }

    /**
     * DELETE /panier/article/{id} - Retirer un article du panier
     */
    public function retirerArticle($user, $articleId) {
        $clientId = $user['client_id'];

        // Vérifier que l'article appartient au client
        $panier = $this->panierModel->getActiveCart($clientId);
        if (!$panier) {
            Response::notFound("Panier introuvable");
        }

        try {
            // Retirer l'article
            $this->panierModel->removeItem($articleId);

            // Récupérer le panier mis à jour
            $items = $this->panierModel->getItems($panier['id']);
            $totaux = $this->panierModel->calculateTotal($panier['id']);
            $counts = $this->panierModel->countItems($panier['id']);

            Response::success([
                'message' => 'Article retiré du panier',
                'articles' => $items,
                'totaux' => $totaux,
                'nombre_articles' => $counts['nombre_articles']
            ], 'Article retiré avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la suppression: " . $e->getMessage());
        }
    }

    /**
     * DELETE /panier/vider - Vider le panier
     */
    public function vider($user) {
        $clientId = $user['client_id'];

        $panier = $this->panierModel->getActiveCart($clientId);
        if (!$panier) {
            Response::notFound("Panier introuvable");
        }

        try {
            $this->panierModel->clear($panier['id']);

            Response::success(null, 'Panier vidé avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors du vidage du panier: " . $e->getMessage());
        }
    }

    /**
     * POST /panier/valider - Valider le panier avant commande
     */
    public function valider($user) {
        $clientId = $user['client_id'];

        $panier = $this->panierModel->getActiveCart($clientId);
        if (!$panier) {
            Response::error("Votre panier est vide", 400);
        }

        // Récupérer les articles
        $items = $this->panierModel->getItems($panier['id']);

        if (empty($items)) {
            Response::error("Votre panier est vide", 400);
        }

        // Valider le stock
        $stockErrors = $this->panierModel->validateStock($panier['id']);

        if (!empty($stockErrors)) {
            Response::error("Problèmes de disponibilité", 400, $stockErrors);
        }

        // Calculer les totaux
        $totaux = $this->panierModel->calculateTotal($panier['id']);

        Response::success([
            'valide' => true,
            'articles' => $items,
            'totaux' => $totaux,
            'message' => 'Panier valide, prêt pour la commande'
        ]);
    }

    /**
     * GET /panier/count - Compter les articles
     */
    public function count($user) {
        $clientId = $user['client_id'];

        $panier = $this->panierModel->getActiveCart($clientId);

        if (!$panier) {
            Response::success([
                'nombre_articles' => 0,
                'quantite_totale' => 0
            ]);
            return;
        }

        $counts = $this->panierModel->countItems($panier['id']);

        Response::success($counts);
    }
}

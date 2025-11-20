<?php
/**
 * ProduitController - Gestion des produits
 */

require_once __DIR__ . '/../models/Produit.php';

class ProduitController {
    private $produitModel;

    public function __construct() {
        $this->produitModel = new Produit();
    }

    /**
     * GET /produits - Lister les produits
     */
    public function index() {
        // Pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        // Filtres
        $filters = [];

        if (isset($_GET['boutique_id'])) $filters['boutique_id'] = $_GET['boutique_id'];
        if (isset($_GET['categorie_id'])) $filters['categorie_id'] = $_GET['categorie_id'];
        if (isset($_GET['marque_id'])) $filters['marque_id'] = $_GET['marque_id'];
        if (isset($_GET['genre'])) $filters['genre'] = $_GET['genre'];
        if (isset($_GET['prix_min'])) $filters['prix_min'] = $_GET['prix_min'];
        if (isset($_GET['prix_max'])) $filters['prix_max'] = $_GET['prix_max'];
        if (isset($_GET['nouveautes'])) $filters['nouveautes'] = $_GET['nouveautes'] === 'true';
        if (isset($_GET['coups_coeur'])) $filters['coups_coeur'] = $_GET['coups_coeur'] === 'true';
        if (isset($_GET['promotions'])) $filters['promotions'] = $_GET['promotions'] === 'true';
        if (isset($_GET['en_stock'])) $filters['en_stock'] = $_GET['en_stock'] === 'true';
        if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
        if (isset($_GET['sort'])) $filters['sort'] = $_GET['sort'];

        // Récupérer les produits
        $produits = $this->produitModel->all($filters, $limit, $offset);
        $total = $this->produitModel->count($filters);

        Response::success([
            'produits' => $produits,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ],
            'filters_applied' => $filters
        ]);
    }

    /**
     * GET /produits/nouveautes - Nouveautés
     */
    public function nouveautes() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $produits = $this->produitModel->getNouveautes($limit);

        Response::success([
            'produits' => $produits
        ]);
    }

    /**
     * GET /produits/coups-coeur - Coups de cœur
     */
    public function coupsCoeur() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $produits = $this->produitModel->getCoupsCoeur($limit);

        Response::success([
            'produits' => $produits
        ]);
    }

    /**
     * GET /produits/promotions - Produits en promotion
     */
    public function promotions() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $produits = $this->produitModel->getPromotions($limit);

        Response::success([
            'produits' => $produits
        ]);
    }

    /**
     * GET /produits/{slug} - Détails d'un produit
     */
    public function show($slug) {
        $produit = $this->produitModel->findBySlug($slug);

        if (!$produit) {
            Response::notFound("Produit introuvable");
        }

        if ($produit['statut'] !== 'actif' || !$produit['est_visible']) {
            Response::error("Ce produit n'est plus disponible", 404);
        }

        // Incrémenter le nombre de vues
        $this->produitModel->incrementVues($produit['id']);

        // Récupérer les produits similaires
        $similaires = $this->produitModel->getSimilaires($produit['id'], 6);

        Response::success([
            'produit' => $produit,
            'similaires' => $similaires
        ]);
    }

    /**
     * GET /produits/{id}/similaires - Produits similaires
     */
    public function similaires($id) {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;
        $similaires = $this->produitModel->getSimilaires($id, $limit);

        Response::success([
            'produits' => $similaires
        ]);
    }

    /**
     * POST /produits/{id}/vue - Incrémenter les vues
     */
    public function incrementVue($id) {
        $this->produitModel->incrementVues($id);

        Response::success(null, "Vue enregistrée");
    }

    /**
     * GET /produits/{id}/stock - Vérifier le stock
     */
    public function checkStock($id) {
        $quantity = isset($_GET['quantity']) ? (int)$_GET['quantity'] : 1;
        $available = $this->produitModel->checkStock($id, $quantity);

        Response::success([
            'available' => $available,
            'quantity_requested' => $quantity
        ]);
    }
}

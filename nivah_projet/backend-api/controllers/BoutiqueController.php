<?php
/**
 * BoutiqueController - Gestion des boutiques
 */

require_once __DIR__ . '/../models/Boutique.php';

class BoutiqueController {
    private $boutiqueModel;

    public function __construct() {
        $this->boutiqueModel = new Boutique();
    }

    /**
     * GET /boutiques - Lister les boutiques
     */
    public function index() {
        // Pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        // Filtres
        $filters = [];

        if (isset($_GET['featured'])) {
            $filters['featured'] = $_GET['featured'] === 'true' || $_GET['featured'] === '1';
        }

        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $filters['search'] = $_GET['search'];
        }

        if (isset($_GET['sort'])) {
            $filters['sort'] = $_GET['sort'];
        }

        // Récupérer les boutiques
        $boutiques = $this->boutiqueModel->all($filters, $limit, $offset);
        $total = $this->boutiqueModel->count($filters);

        Response::success([
            'boutiques' => $boutiques,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * GET /boutiques/featured - Boutiques mises en avant
     */
    public function featured() {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
        $boutiques = $this->boutiqueModel->getFeatured($limit);

        Response::success([
            'boutiques' => $boutiques
        ]);
    }

    /**
     * GET /boutiques/{slug} - Détails d'une boutique
     */
    public function show($slug) {
        $boutique = $this->boutiqueModel->findBySlug($slug);

        if (!$boutique) {
            Response::notFound("Boutique introuvable");
        }

        if (!$boutique['est_active']) {
            Response::error("Cette boutique n'est plus disponible", 404);
        }

        Response::success($boutique);
    }

    /**
     * GET /boutiques/{slug}/produits - Produits d'une boutique
     */
    public function produits($slug) {
        $boutique = $this->boutiqueModel->findBySlug($slug);

        if (!$boutique || !$boutique['est_active']) {
            Response::notFound("Boutique introuvable");
        }

        // Récupérer les produits de la boutique
        require_once __DIR__ . '/../models/Produit.php';
        $produitModel = new Produit();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $filters = ['boutique_id' => $boutique['id']];

        // Ajouter les autres filtres
        if (isset($_GET['categorie_id'])) $filters['categorie_id'] = $_GET['categorie_id'];
        if (isset($_GET['genre'])) $filters['genre'] = $_GET['genre'];
        if (isset($_GET['prix_min'])) $filters['prix_min'] = $_GET['prix_min'];
        if (isset($_GET['prix_max'])) $filters['prix_max'] = $_GET['prix_max'];
        if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
        if (isset($_GET['sort'])) $filters['sort'] = $_GET['sort'];

        $produits = $produitModel->all($filters, $limit, $offset);
        $total = $produitModel->count($filters);

        Response::success([
            'boutique' => $boutique,
            'produits' => $produits,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }
}

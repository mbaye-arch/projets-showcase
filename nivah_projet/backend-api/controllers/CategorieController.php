<?php
/**
 * CategorieController - Gestion des catégories
 */

require_once __DIR__ . '/../models/Categorie.php';

class CategorieController {
    private $categorieModel;

    public function __construct() {
        $this->categorieModel = new Categorie();
    }

    /**
     * GET /categories - Liste des catégories (arbre hiérarchique)
     */
    public function index() {
        $format = isset($_GET['format']) ? $_GET['format'] : 'tree';

        if ($format === 'flat') {
            // Liste plate
            $categories = $this->categorieModel->all();
            Response::success(['categories' => $categories]);
        } else {
            // Arbre hiérarchique
            $tree = $this->categorieModel->getTree();
            Response::success(['categories' => $tree]);
        }
    }

    /**
     * GET /categories/{slug} - Détails d'une catégorie
     */
    public function show($slug) {
        $categorie = $this->categorieModel->findBySlug($slug);

        if (!$categorie) {
            Response::notFound("Catégorie introuvable");
        }

        if (!$categorie['est_actif']) {
            Response::error("Cette catégorie n'est pas disponible", 404);
        }

        // Récupérer les sous-catégories
        $enfants = $this->categorieModel->getChildren($categorie['id']);

        // Compter les produits
        $nombreProduits = $this->categorieModel->countProduits($categorie['id'], true);

        Response::success([
            'categorie' => $categorie,
            'sous_categories' => $enfants,
            'nombre_produits' => $nombreProduits
        ]);
    }

    /**
     * GET /categories/{id}/produits - Produits d'une catégorie
     */
    public function produits($id) {
        $categorie = $this->categorieModel->find($id);

        if (!$categorie || !$categorie['est_actif']) {
            Response::notFound("Catégorie introuvable");
        }

        require_once __DIR__ . '/../models/Produit.php';
        $produitModel = new Produit();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $filters = ['categorie_id' => $id];

        // Ajouter les autres filtres
        if (isset($_GET['prix_min'])) $filters['prix_min'] = $_GET['prix_min'];
        if (isset($_GET['prix_max'])) $filters['prix_max'] = $_GET['prix_max'];
        if (isset($_GET['genre'])) $filters['genre'] = $_GET['genre'];
        if (isset($_GET['marque_id'])) $filters['marque_id'] = $_GET['marque_id'];
        if (isset($_GET['sort'])) $filters['sort'] = $_GET['sort'];

        $produits = $produitModel->all($filters, $limit, $offset);
        $total = $produitModel->count($filters);

        Response::success([
            'categorie' => $categorie,
            'produits' => $produits,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * GET /categories/{id}/children - Sous-catégories
     */
    public function children($id) {
        $categorie = $this->categorieModel->find($id);

        if (!$categorie) {
            Response::notFound("Catégorie introuvable");
        }

        $enfants = $this->categorieModel->getChildren($id);

        Response::success([
            'categorie' => $categorie,
            'sous_categories' => $enfants
        ]);
    }
}

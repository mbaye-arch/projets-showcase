<?php
/**
 * MarqueController - Gestion des marques
 */

class MarqueController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * GET /marques - Liste des marques
     */
    public function index() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = ($page - 1) * $limit;

        $sql = "SELECT * FROM marques WHERE est_actif = TRUE";
        $params = [];

        // Filtre premium
        if (isset($_GET['premium']) && $_GET['premium'] === 'true') {
            $sql .= " AND est_premium = TRUE";
        }

        // Recherche
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $sql .= " AND (nom LIKE ? OR description LIKE ?)";
            $searchTerm = "%" . $_GET['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY nom ASC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $marques = $this->db->query($sql, $params);

        // Compter le total
        $countSql = "SELECT COUNT(*) as total FROM marques WHERE est_actif = TRUE";
        $countParams = [];

        if (isset($_GET['premium']) && $_GET['premium'] === 'true') {
            $countSql .= " AND est_premium = TRUE";
        }

        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $countSql .= " AND (nom LIKE ? OR description LIKE ?)";
            $searchTerm = "%" . $_GET['search'] . "%";
            $countParams[] = $searchTerm;
            $countParams[] = $searchTerm;
        }

        $totalResult = $this->db->queryOne($countSql, $countParams);
        $total = $totalResult['total'];

        Response::success([
            'marques' => $marques,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * GET /marques/{slug} - Détails d'une marque
     */
    public function show($slug) {
        $marque = $this->db->queryOne(
            "SELECT * FROM marques WHERE slug = ? AND est_actif = TRUE",
            [$slug]
        );

        if (!$marque) {
            Response::notFound("Marque introuvable");
        }

        // Compter le nombre de produits
        $countResult = $this->db->queryOne(
            "SELECT COUNT(*) as total FROM produits WHERE marque_id = ? AND statut = 'actif'",
            [$marque['id']]
        );

        $marque['nombre_produits'] = (int)$countResult['total'];

        Response::success(['marque' => $marque]);
    }

    /**
     * GET /marques/{id}/produits - Produits d'une marque
     */
    public function produits($id) {
        $marque = $this->db->queryOne(
            "SELECT * FROM marques WHERE id = ? AND est_actif = TRUE",
            [$id]
        );

        if (!$marque) {
            Response::notFound("Marque introuvable");
        }

        require_once __DIR__ . '/../models/Produit.php';
        $produitModel = new Produit();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $filters = ['marque_id' => $id];

        // Ajouter les autres filtres
        if (isset($_GET['categorie_id'])) $filters['categorie_id'] = $_GET['categorie_id'];
        if (isset($_GET['genre'])) $filters['genre'] = $_GET['genre'];
        if (isset($_GET['prix_min'])) $filters['prix_min'] = $_GET['prix_min'];
        if (isset($_GET['prix_max'])) $filters['prix_max'] = $_GET['prix_max'];
        if (isset($_GET['sort'])) $filters['sort'] = $_GET['sort'];

        $produits = $produitModel->all($filters, $limit, $offset);
        $total = $produitModel->count($filters);

        Response::success([
            'marque' => $marque,
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
     * GET /marques/premium - Marques premium
     */
    public function premium() {
        $marques = $this->db->query(
            "SELECT * FROM marques WHERE est_actif = TRUE AND est_premium = TRUE ORDER BY nom ASC"
        );

        Response::success(['marques' => $marques]);
    }
}

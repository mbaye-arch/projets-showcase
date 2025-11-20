<?php
/**
 * Modèle Produit
 */

class Produit {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouver un produit par ID
     */
    public function find($id) {
        $sql = "SELECT p.*, b.nom_boutique, b.slug as boutique_slug,
                       c.nom as categorie_nom, m.nom as marque_nom,
                       (
                           SELECT ip.url
                           FROM images_produits ip
                           WHERE ip.produit_id = p.id AND ip.est_principale = TRUE
                           ORDER BY ip.ordre ASC
                           LIMIT 1
                       ) as image_principale
                FROM produits p
                LEFT JOIN boutiques b ON p.boutique_id = b.id
                LEFT JOIN categories c ON p.categorie_id = c.id
                LEFT JOIN marques m ON p.marque_id = m.id
                WHERE p.id = ?";

        return $this->db->queryOne($sql, [$id]);
    }

    /**
     * Trouver un produit par slug
     */
    public function findBySlug($slug) {
        $sql = "SELECT p.*, b.nom_boutique, b.slug as boutique_slug,
                       c.nom as categorie_nom, m.nom as marque_nom,
                       (
                           SELECT ip.url
                           FROM images_produits ip
                           WHERE ip.produit_id = p.id AND ip.est_principale = TRUE
                           ORDER BY ip.ordre ASC
                           LIMIT 1
                       ) as image_principale
                FROM produits p
                LEFT JOIN boutiques b ON p.boutique_id = b.id
                LEFT JOIN categories c ON p.categorie_id = c.id
                LEFT JOIN marques m ON p.marque_id = m.id
                WHERE p.slug = ?";

        return $this->db->queryOne($sql, [$slug]);
    }

    /**
     * Lister les produits avec filtres
     */
    public function all($filters = [], $limit = 20, $offset = 0) {
        $sql = "SELECT p.*, b.nom_boutique, b.slug as boutique_slug,
                       c.nom as categorie_nom, m.nom as marque_nom,
                       (
                           SELECT ip.url
                           FROM images_produits ip
                           WHERE ip.produit_id = p.id AND ip.est_principale = TRUE
                           ORDER BY ip.ordre ASC
                           LIMIT 1
                       ) as image_principale
                FROM produits p
                LEFT JOIN boutiques b ON p.boutique_id = b.id
                LEFT JOIN categories c ON p.categorie_id = c.id
                LEFT JOIN marques m ON p.marque_id = m.id
                WHERE p.statut = 'actif' AND p.est_visible = TRUE";

        $params = [];

        // Filtre par boutique
        if (isset($filters['boutique_id'])) {
            $sql .= " AND p.boutique_id = ?";
            $params[] = $filters['boutique_id'];
        }

        // Filtre par catégorie
        if (isset($filters['categorie_id'])) {
            $sql .= " AND p.categorie_id = ?";
            $params[] = $filters['categorie_id'];
        }

        // Filtre par marque
        if (isset($filters['marque_id'])) {
            $sql .= " AND p.marque_id = ?";
            $params[] = $filters['marque_id'];
        }

        // Filtre par genre
        if (isset($filters['genre'])) {
            $sql .= " AND p.genre = ?";
            $params[] = $filters['genre'];
        }

        // Filtre par prix
        if (isset($filters['prix_min'])) {
            $sql .= " AND p.prix_vente >= ?";
            $params[] = $filters['prix_min'];
        }

        if (isset($filters['prix_max'])) {
            $sql .= " AND p.prix_vente <= ?";
            $params[] = $filters['prix_max'];
        }

        // Filtre nouveautés
        if (isset($filters['nouveautes']) && $filters['nouveautes']) {
            $sql .= " AND p.est_nouveaute = TRUE";
        }

        // Filtre coups de cœur
        if (isset($filters['coups_coeur']) && $filters['coups_coeur']) {
            $sql .= " AND p.est_coup_coeur = TRUE";
        }

        // Filtre promotions
        if (isset($filters['promotions']) && $filters['promotions']) {
            $sql .= " AND p.prix_promo IS NOT NULL AND p.prix_promo < p.prix_vente";
        }

        // Filtre en stock
        if (isset($filters['en_stock']) && $filters['en_stock']) {
            $sql .= " AND (p.stock_illimite = TRUE OR p.quantite_stock > 0)";
        }

        // Recherche
        if (isset($filters['search']) && !empty($filters['search'])) {
            $sql .= " AND (p.nom LIKE ? OR p.description_courte LIKE ? OR p.reference_interne LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Tri
        if (isset($filters['sort'])) {
            switch ($filters['sort']) {
                case 'prix_asc':
                    $sql .= " ORDER BY p.prix_vente ASC";
                    break;
                case 'prix_desc':
                    $sql .= " ORDER BY p.prix_vente DESC";
                    break;
                case 'nom_asc':
                    $sql .= " ORDER BY p.nom ASC";
                    break;
                case 'nom_desc':
                    $sql .= " ORDER BY p.nom DESC";
                    break;
                case 'note':
                    $sql .= " ORDER BY p.note_moyenne DESC";
                    break;
                case 'ventes':
                    $sql .= " ORDER BY p.nombre_ventes DESC";
                    break;
                case 'nouveautes':
                    $sql .= " ORDER BY p.created_at DESC";
                    break;
                default:
                    $sql .= " ORDER BY p.created_at DESC";
            }
        } else {
            $sql .= " ORDER BY p.created_at DESC";
        }

        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->query($sql, $params);
    }

    /**
     * Compter les produits
     */
    public function count($filters = []) {
        $sql = "SELECT COUNT(*) as total FROM produits p WHERE p.statut = 'actif' AND p.est_visible = TRUE";
        $params = [];

        if (isset($filters['boutique_id'])) {
            $sql .= " AND p.boutique_id = ?";
            $params[] = $filters['boutique_id'];
        }

        if (isset($filters['categorie_id'])) {
            $sql .= " AND p.categorie_id = ?";
            $params[] = $filters['categorie_id'];
        }

        if (isset($filters['genre'])) {
            $sql .= " AND p.genre = ?";
            $params[] = $filters['genre'];
        }

        if (isset($filters['prix_min'])) {
            $sql .= " AND p.prix_vente >= ?";
            $params[] = $filters['prix_min'];
        }

        if (isset($filters['prix_max'])) {
            $sql .= " AND p.prix_vente <= ?";
            $params[] = $filters['prix_max'];
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $sql .= " AND (p.nom LIKE ? OR p.description_courte LIKE ? OR p.reference_interne LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $result = $this->db->queryOne($sql, $params);
        return $result['total'];
    }

    /**
     * Obtenir les nouveautés
     */
    public function getNouveautes($limit = 10) {
        return $this->all(['nouveautes' => true], $limit, 0);
    }

    /**
     * Obtenir les coups de cœur
     */
    public function getCoupsCoeur($limit = 10) {
        return $this->all(['coups_coeur' => true], $limit, 0);
    }

    /**
     * Obtenir les promotions
     */
    public function getPromotions($limit = 20) {
        return $this->all(['promotions' => true], $limit, 0);
    }

    /**
     * Obtenir les produits similaires
     */
    public function getSimilaires($produitId, $limit = 6) {
        $produit = $this->find($produitId);

        if (!$produit) {
            return [];
        }

        $sql = "SELECT p.*, b.nom_boutique, c.nom as categorie_nom,
                       (
                           SELECT ip.url
                           FROM images_produits ip
                           WHERE ip.produit_id = p.id AND ip.est_principale = TRUE
                           ORDER BY ip.ordre ASC
                           LIMIT 1
                       ) as image_principale
                FROM produits p
                LEFT JOIN boutiques b ON p.boutique_id = b.id
                LEFT JOIN categories c ON p.categorie_id = c.id
                WHERE p.id != ?
                  AND p.statut = 'actif'
                  AND p.est_visible = TRUE
                  AND (p.categorie_id = ? OR p.genre = ?)
                ORDER BY RAND()
                LIMIT ?";

        return $this->db->query($sql, [
            $produitId,
            $produit['categorie_id'],
            $produit['genre'],
            $limit
        ]);
    }

    /**
     * Incrémenter le nombre de vues
     */
    public function incrementVues($id) {
        return $this->db->execute(
            "UPDATE produits SET nombre_vues = nombre_vues + 1 WHERE id = ?",
            [$id]
        );
    }

    /**
     * Incrémenter le nombre de ventes
     */
    public function incrementVentes($id, $quantity = 1) {
        return $this->db->execute(
            "UPDATE produits SET nombre_ventes = nombre_ventes + ? WHERE id = ?",
            [$quantity, $id]
        );
    }

    /**
     * Décrémenter le stock
     */
    public function decrementStock($id, $quantity) {
        return $this->db->execute(
            "UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ? AND stock_illimite = FALSE",
            [$quantity, $id]
        );
    }

    /**
     * Vérifier la disponibilité du stock
     */
    public function checkStock($id, $quantity) {
        $produit = $this->find($id);

        if (!$produit) {
            return false;
        }

        if ($produit['stock_illimite']) {
            return true;
        }

        return $produit['quantite_stock'] >= $quantity;
    }

    /**
     * Créer un produit
     */
    public function create($data) {
        $sql = "INSERT INTO produits (
            boutique_id, reference_interne, nom, slug,
            description_courte, description_longue,
            categorie_id, marque_id,
            prix_vente, prix_promo, devise,
            quantite_stock, stock_illimite,
            genre, statut, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $this->db->execute($sql, [
            $data['boutique_id'] ?? null,
            $data['reference_interne'],
            $data['nom'],
            $data['slug'],
            $data['description_courte'] ?? null,
            $data['description_longue'] ?? null,
            $data['categorie_id'],
            $data['marque_id'] ?? null,
            $data['prix_vente'],
            $data['prix_promo'] ?? null,
            $data['devise'] ?? 'XOF',
            $data['quantite_stock'] ?? 0,
            $data['stock_illimite'] ?? false,
            $data['genre'] ?? 'mixte',
            $data['statut'] ?? 'actif'
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Mettre à jour un produit
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }

        $values[] = $id;

        $sql = "UPDATE produits SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, $values);
    }

    /**
     * Supprimer un produit (soft delete)
     */
    public function delete($id) {
        return $this->db->execute(
            "UPDATE produits SET statut = 'archive', updated_at = NOW() WHERE id = ?",
            [$id]
        );
    }
}

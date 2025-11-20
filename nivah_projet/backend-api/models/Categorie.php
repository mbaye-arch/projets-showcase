<?php
/**
 * Modèle Catégorie
 */

class Categorie {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouver une catégorie par ID
     */
    public function find($id) {
        return $this->db->queryOne(
            "SELECT * FROM categories WHERE id = ?",
            [$id]
        );
    }

    /**
     * Trouver une catégorie par slug
     */
    public function findBySlug($slug) {
        return $this->db->queryOne(
            "SELECT * FROM categories WHERE slug = ?",
            [$slug]
        );
    }

    /**
     * Lister toutes les catégories actives
     */
    public function all($parentId = null) {
        if ($parentId === null) {
            // Catégories racines
            return $this->db->query(
                "SELECT * FROM categories
                 WHERE est_actif = TRUE AND parent_id IS NULL
                 ORDER BY ordre ASC, nom ASC"
            );
        } else {
            // Sous-catégories
            return $this->db->query(
                "SELECT * FROM categories
                 WHERE est_actif = TRUE AND parent_id = ?
                 ORDER BY ordre ASC, nom ASC",
                [$parentId]
            );
        }
    }

    /**
     * Obtenir l'arbre des catégories
     */
    public function getTree() {
        $categories = $this->db->query(
            "SELECT * FROM categories WHERE est_actif = TRUE ORDER BY ordre ASC, nom ASC"
        );

        return $this->buildTree($categories);
    }

    /**
     * Construire l'arbre hiérarchique
     */
    private function buildTree($categories, $parentId = null) {
        $branch = [];

        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $children = $this->buildTree($categories, $category['id']);
                if ($children) {
                    $category['children'] = $children;
                }
                $branch[] = $category;
            }
        }

        return $branch;
    }

    /**
     * Obtenir les sous-catégories
     */
    public function getChildren($id) {
        return $this->db->query(
            "SELECT * FROM categories WHERE parent_id = ? AND est_actif = TRUE ORDER BY ordre ASC",
            [$id]
        );
    }

    /**
     * Compter les produits dans une catégorie
     */
    public function countProduits($id, $includeChildren = true) {
        if (!$includeChildren) {
            $result = $this->db->queryOne(
                "SELECT COUNT(*) as total FROM produits WHERE categorie_id = ? AND statut = 'actif'",
                [$id]
            );
            return $result['total'];
        }

        // Inclure les sous-catégories
        $categoryIds = $this->getAllChildrenIds($id);
        $categoryIds[] = $id;

        $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
        $sql = "SELECT COUNT(*) as total FROM produits
                WHERE categorie_id IN ($placeholders) AND statut = 'actif'";

        $result = $this->db->queryOne($sql, $categoryIds);
        return $result['total'];
    }

    /**
     * Obtenir tous les IDs des sous-catégories récursivement
     */
    private function getAllChildrenIds($parentId) {
        $ids = [];
        $children = $this->getChildren($parentId);

        foreach ($children as $child) {
            $ids[] = $child['id'];
            $childrenIds = $this->getAllChildrenIds($child['id']);
            $ids = array_merge($ids, $childrenIds);
        }

        return $ids;
    }

    /**
     * Créer une catégorie
     */
    public function create($data) {
        $sql = "INSERT INTO categories (
            parent_id, nom, slug, description,
            icone, image_url, ordre, est_actif,
            type_produit, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $this->db->execute($sql, [
            $data['parent_id'] ?? null,
            $data['nom'],
            $data['slug'],
            $data['description'] ?? null,
            $data['icone'] ?? null,
            $data['image_url'] ?? null,
            $data['ordre'] ?? 0,
            $data['est_actif'] ?? true,
            $data['type_produit'] ?? 'physique'
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Mettre à jour une catégorie
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }

        $values[] = $id;

        $sql = "UPDATE categories SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, $values);
    }

    /**
     * Supprimer une catégorie
     */
    public function delete($id) {
        // Vérifier s'il y a des produits
        $count = $this->countProduits($id, false);
        if ($count > 0) {
            throw new Exception("Impossible de supprimer une catégorie contenant des produits");
        }

        // Vérifier s'il y a des sous-catégories
        $children = $this->getChildren($id);
        if (count($children) > 0) {
            throw new Exception("Impossible de supprimer une catégorie contenant des sous-catégories");
        }

        return $this->db->execute(
            "DELETE FROM categories WHERE id = ?",
            [$id]
        );
    }
}

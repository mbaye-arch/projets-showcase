<?php
/**
 * Modèle Boutique
 */

class Boutique {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouver une boutique par ID
     */
    public function find($id) {
        return $this->db->queryOne(
            "SELECT * FROM boutiques WHERE id = ?",
            [$id]
        );
    }

    /**
     * Trouver une boutique par slug
     */
    public function findBySlug($slug) {
        return $this->db->queryOne(
            "SELECT * FROM boutiques WHERE slug = ?",
            [$slug]
        );
    }

    /**
     * Lister toutes les boutiques actives
     */
    public function all($filters = [], $limit = 20, $offset = 0) {
        $sql = "SELECT * FROM boutiques WHERE est_active = TRUE";
        $params = [];

        if (isset($filters['featured']) && $filters['featured']) {
            $sql .= " AND est_featured = TRUE";
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $sql .= " AND (nom_boutique LIKE ? OR description LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Tri
        if (isset($filters['sort'])) {
            switch ($filters['sort']) {
                case 'nom_asc':
                    $sql .= " ORDER BY nom_boutique ASC";
                    break;
                case 'nom_desc':
                    $sql .= " ORDER BY nom_boutique DESC";
                    break;
                case 'note':
                    $sql .= " ORDER BY note_moyenne DESC";
                    break;
                case 'ventes':
                    $sql .= " ORDER BY nombre_ventes DESC";
                    break;
                default:
                    $sql .= " ORDER BY ordre_affichage ASC, nom_boutique ASC";
            }
        } else {
            $sql .= " ORDER BY ordre_affichage ASC, nom_boutique ASC";
        }

        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->query($sql, $params);
    }

    /**
     * Obtenir les boutiques featured
     */
    public function getFeatured($limit = 5) {
        return $this->db->query(
            "SELECT * FROM boutiques
             WHERE est_active = TRUE AND est_featured = TRUE
             ORDER BY ordre_affichage ASC
             LIMIT ?",
            [$limit]
        );
    }

    /**
     * Compter les boutiques
     */
    public function count($filters = []) {
        $sql = "SELECT COUNT(*) as total FROM boutiques WHERE est_active = TRUE";
        $params = [];

        if (isset($filters['featured']) && $filters['featured']) {
            $sql .= " AND est_featured = TRUE";
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $sql .= " AND (nom_boutique LIKE ? OR description LIKE ?)";
            $searchTerm = "%" . $filters['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $result = $this->db->queryOne($sql, $params);
        return $result['total'];
    }

    /**
     * Incrémenter le nombre de ventes
     */
    public function incrementVentes($id, $quantity = 1) {
        return $this->db->execute(
            "UPDATE boutiques SET nombre_ventes = nombre_ventes + ? WHERE id = ?",
            [$quantity, $id]
        );
    }

    /**
     * Mettre à jour le nombre de produits
     */
    public function updateNombreProduits($id) {
        $count = $this->db->queryOne(
            "SELECT COUNT(*) as total FROM produits WHERE boutique_id = ? AND statut = 'actif'",
            [$id]
        );

        return $this->db->execute(
            "UPDATE boutiques SET nombre_produits = ? WHERE id = ?",
            [$count['total'], $id]
        );
    }

    /**
     * Calculer et mettre à jour la note moyenne
     */
    public function updateNoteMoyenne($id) {
        // TODO: Calculer à partir des avis produits
        // Pour l'instant, retourner true
        return true;
    }

    /**
     * Créer une boutique
     */
    public function create($data) {
        $sql = "INSERT INTO boutiques (
            nom_boutique, slug, logo_url, description,
            est_active, est_featured, ordre_affichage,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

        $this->db->execute($sql, [
            $data['nom_boutique'],
            $data['slug'],
            $data['logo_url'],
            $data['description'] ?? null,
            $data['est_active'] ?? true,
            $data['est_featured'] ?? false,
            $data['ordre_affichage'] ?? 0
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Mettre à jour une boutique
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }

        $values[] = $id;

        $sql = "UPDATE boutiques SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, $values);
    }

    /**
     * Activer/Désactiver une boutique
     */
    public function toggleActive($id) {
        return $this->db->execute(
            "UPDATE boutiques SET est_active = NOT est_active WHERE id = ?",
            [$id]
        );
    }

    /**
     * Supprimer une boutique
     */
    public function delete($id) {
        // Note: Cela peut échouer si des produits y sont liés
        return $this->db->execute(
            "DELETE FROM boutiques WHERE id = ?",
            [$id]
        );
    }
}

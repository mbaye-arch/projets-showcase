<?php
/**
 * Modèle Panier
 */

class Panier {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Obtenir le panier actif du client
     */
    public function getActiveCart($clientId) {
        return $this->db->queryOne(
            "SELECT * FROM paniers WHERE client_id = ? AND statut = 'actif' ORDER BY created_at DESC LIMIT 1",
            [$clientId]
        );
    }

    /**
     * Créer un nouveau panier
     */
    public function create($clientId, $sessionId = null) {
        // Générer un session_id si non fourni (champ NOT NULL dans BDD)
        if (empty($sessionId)) {
            $sessionId = 'SESSION-' . $clientId . '-' . time() . '-' . bin2hex(random_bytes(8));
        }

        $referencePanier = 'CART-' . date('Ymd') . '-' . str_pad((string)random_int(1, 999999), 6, '0', STR_PAD_LEFT);

        $sql = "INSERT INTO paniers (client_id, session_id, reference_panier, statut, created_at)
                VALUES (?, ?, ?, 'actif', NOW())";

        $this->db->execute($sql, [$clientId, $sessionId, $referencePanier]);
        return $this->db->lastInsertId();
    }

    /**
     * Obtenir ou créer le panier du client
     */
    public function getOrCreate($clientId) {
        $panier = $this->getActiveCart($clientId);

        if (!$panier) {
            $panierId = $this->create($clientId);
            $panier = $this->db->queryOne("SELECT * FROM paniers WHERE id = ?", [$panierId]);
        }

        return $panier;
    }

    /**
     * Obtenir tous les articles du panier avec détails produits
     */
    public function getItems($panierId) {
        $sql = "SELECT pa.*, p.nom, p.slug, p.prix_vente, p.prix_promo,
                       p.quantite_stock, p.stock_illimite,
                       p.est_visible, p.statut as produit_statut,
                       b.nom_boutique, b.slug as boutique_slug
                FROM panier_articles pa
                JOIN produits p ON pa.produit_id = p.id
                LEFT JOIN boutiques b ON p.boutique_id = b.id
                WHERE pa.panier_id = ?
                ORDER BY pa.created_at DESC";

        return $this->db->query($sql, [$panierId]);
    }

    /**
     * Ajouter un article au panier
     */
    public function addItem($panierId, $produitId, $quantite = 1, $varianteId = null) {
        // Vérifier si l'article existe déjà
        $existing = $this->db->queryOne(
            "SELECT * FROM panier_articles WHERE panier_id = ? AND produit_id = ? AND variante_id <=> ?",
            [$panierId, $produitId, $varianteId]
        );

        if ($existing) {
            // Mettre à jour la quantité
            return $this->db->execute(
                "UPDATE panier_articles SET quantite = quantite + ?, updated_at = NOW()
                 WHERE id = ?",
                [$quantite, $existing['id']]
            );
        } else {
            // Récupérer les infos du produit pour remplir les champs obligatoires
            $produit = $this->db->queryOne(
                "SELECT nom, prix_vente, prix_promo FROM produits WHERE id = ?",
                [$produitId]
            );

            if (!$produit) {
                throw new Exception("Produit introuvable");
            }

            $prixFinal = $produit['prix_promo'] ?? $produit['prix_vente'];

            // Ajouter un nouvel article
            $sql = "INSERT INTO panier_articles
                    (panier_id, produit_id, variante_id, quantite, prix_unitaire, prix_promo, prix_final, nom_produit, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

            return $this->db->execute($sql, [
                $panierId,
                $produitId,
                $varianteId,
                $quantite,
                $produit['prix_vente'],
                $produit['prix_promo'],
                $prixFinal,
                $produit['nom']
            ]);
        }
    }

    /**
     * Mettre à jour la quantité d'un article
     */
    public function updateItemQuantity($articleId, $quantite) {
        if ($quantite <= 0) {
            return $this->removeItem($articleId);
        }

        return $this->db->execute(
            "UPDATE panier_articles SET quantite = ?, updated_at = NOW() WHERE id = ?",
            [$quantite, $articleId]
        );
    }

    /**
     * Retirer un article du panier
     */
    public function removeItem($articleId) {
        return $this->db->execute(
            "DELETE FROM panier_articles WHERE id = ?",
            [$articleId]
        );
    }

    /**
     * Vider le panier
     */
    public function clear($panierId) {
        return $this->db->execute(
            "DELETE FROM panier_articles WHERE panier_id = ?",
            [$panierId]
        );
    }

    /**
     * Calculer le total du panier
     */
    public function calculateTotal($panierId) {
        $items = $this->getItems($panierId);
        $sousTotal = 0;
        $remise = 0;

        foreach ($items as $item) {
            $prix = $item['prix_promo'] ?? $item['prix_vente'];
            $sousTotal += $prix * $item['quantite'];

            // Calculer remise si prix promo
            if ($item['prix_promo']) {
                $remise += ($item['prix_vente'] - $item['prix_promo']) * $item['quantite'];
            }
        }

        // TODO: Calculer frais de livraison et appliquer codes promo

        return [
            'sous_total' => $sousTotal,
            'remise' => $remise,
            'frais_livraison' => 0, // À calculer
            'total' => $sousTotal
        ];
    }

    /**
     * Compter les articles dans le panier
     */
    public function countItems($panierId) {
        $result = $this->db->queryOne(
            "SELECT COUNT(*) as total, SUM(quantite) as total_quantite
             FROM panier_articles WHERE panier_id = ?",
            [$panierId]
        );

        return [
            'nombre_articles' => (int)$result['total'],
            'quantite_totale' => (int)$result['total_quantite']
        ];
    }

    /**
     * Transformer le panier en commande (changer statut)
     */
    public function convertToOrder($panierId) {
        return $this->db->execute(
            "UPDATE paniers SET statut = 'converti', updated_at = NOW() WHERE id = ?",
            [$panierId]
        );
    }

    /**
     * Valider le stock avant commande
     */
    public function validateStock($panierId) {
        $items = $this->getItems($panierId);
        $errors = [];

        foreach ($items as $item) {
            // Vérifier si le produit est toujours visible et actif
            if (!$item['est_visible'] || $item['produit_statut'] !== 'actif') {
                $errors[] = "Le produit '{$item['nom']}' n'est plus disponible";
                continue;
            }

            // Vérifier le stock
            if (!$item['stock_illimite'] && $item['quantite_stock'] < $item['quantite']) {
                $errors[] = "Stock insuffisant pour '{$item['nom']}' (disponible: {$item['quantite_stock']})";
            }
        }

        return $errors;
    }

    /**
     * Nettoyer les paniers abandonnés (> 30 jours)
     */
    public static function cleanAbandonedCarts() {
        $db = Database::getInstance();
        return $db->execute(
            "DELETE FROM paniers WHERE statut = 'actif' AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
    }
}

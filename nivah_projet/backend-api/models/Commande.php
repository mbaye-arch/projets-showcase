<?php
/**
 * Modèle Commande
 */

class Commande {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouver une commande par ID
     */
    public function find($id) {
        return $this->db->queryOne(
            "SELECT * FROM commandes WHERE id = ?",
            [$id]
        );
    }

    /**
     * Trouver une commande par numéro
     */
    public function findByNumero($numero) {
        // CORRECTION: La colonne s'appelle "numero_commande" dans la BDD, pas "numero"
        return $this->db->queryOne(
            "SELECT * FROM commandes WHERE numero_commande = ?",
            [$numero]
        );
    }

    /**
     * Lister les commandes d'un client
     */
    public function getByClient($clientId, $filters = [], $limit = 20, $offset = 0) {
        $sql = "SELECT * FROM commandes WHERE client_id = ?";
        $params = [$clientId];

        if (isset($filters['statut'])) {
            $sql .= " AND statut = ?";
            $params[] = $filters['statut'];
        }

        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->query($sql, $params);
    }

    /**
     * Compter les commandes d'un client
     */
    public function countByClient($clientId, $filters = []) {
        $sql = "SELECT COUNT(*) as total FROM commandes WHERE client_id = ?";
        $params = [$clientId];

        if (isset($filters['statut'])) {
            $sql .= " AND statut = ?";
            $params[] = $filters['statut'];
        }

        $result = $this->db->queryOne($sql, $params);
        return $result['total'];
    }

    /**
     * Obtenir les articles d'une commande
     */
    public function getItems($commandeId) {
        $sql = "SELECT ca.*, p.nom, p.slug, p.prix_vente,
                       b.nom_boutique, b.slug as boutique_slug
                FROM commande_articles ca
                JOIN produits p ON ca.produit_id = p.id
                LEFT JOIN boutiques b ON p.boutique_id = b.id
                WHERE ca.commande_id = ?";

        return $this->db->query($sql, [$commandeId]);
    }

    /**
     * Créer une commande depuis le panier
     */
    public function createFromCart($clientId, $panierId, $data) {
        $this->db->beginTransaction();

        try {
            // Valider les données requises
            if (empty($data['adresse_livraison'])) {
                throw new Exception("Adresse de livraison requise");
            }

            // Récupérer les articles du panier
            $panierModel = new Panier();
            $items = $panierModel->getItems($panierId);

            if (empty($items)) {
                throw new Exception("Le panier est vide");
            }

            // Valider le stock
            $stockErrors = $panierModel->validateStock($panierId);
            if (!empty($stockErrors)) {
                throw new Exception(implode(', ', $stockErrors));
            }

            // Calculer les totaux
            $totaux = $panierModel->calculateTotal($panierId);

            // CORRECTION: Utiliser les vrais noms de colonnes de la BDD
            // La BDD a des champs NOT NULL: numero_commande, nom_destinataire, prenom_destinataire,
            // telephone_destinataire, region_livraison, departement_livraison, commune_livraison,
            // quartier_livraison, adresse_complete, adresse_livraison_json

            // Extraire les infos de l'adresse (devrait être un JSON ou un objet)
            $adresseLivraison = is_string($data['adresse_livraison'])
                ? json_decode($data['adresse_livraison'], true)
                : $data['adresse_livraison'];

            // Récupérer le client pour les infos manquantes
            $client = $this->db->queryOne("SELECT * FROM clients WHERE id = ?", [$clientId]);

            $sql = "INSERT INTO commandes (
                client_id, numero_commande, statut,
                adresse_livraison_json,
                region_livraison, departement_livraison, commune_livraison,
                quartier_livraison, adresse_complete,
                nom_destinataire, prenom_destinataire, telephone_destinataire,
                mode_livraison, mode_paiement,
                sous_total, frais_livraison, total_remise, total_final,
                devise, created_at
            ) VALUES (?, ?, 'en_attente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'XOF', NOW())";

            // Générer numéro unique
            $numeroCommande = 'NIV-' . date('Ymd') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

            // Construire l'adresse complète
            $adresseComplete = ($adresseLivraison['adresse'] ?? $client['adresse']) . ', ' .
                              ($adresseLivraison['quartier'] ?? $client['quartier']) . ', ' .
                              ($adresseLivraison['ville'] ?? $client['ville']);

            $this->db->execute($sql, [
                $clientId,
                $numeroCommande,
                json_encode($adresseLivraison),
                $adresseLivraison['region'] ?? $client['region'] ?? 'Non spécifié',
                $adresseLivraison['departement'] ?? $client['departement'] ?? 'Non spécifié',
                $adresseLivraison['commune'] ?? $client['commune'] ?? 'Non spécifié',
                $adresseLivraison['quartier'] ?? $client['quartier'],
                $adresseComplete,
                $adresseLivraison['nom'] ?? $client['nom'],
                $adresseLivraison['prenom'] ?? $client['prenom'],
                $adresseLivraison['telephone'] ?? $client['telephone'],
                $data['mode_livraison'] ?? 'standard',
                $data['mode_paiement'] ?? 'mobile_money',
                $totaux['sous_total'],
                $totaux['frais_livraison'],
                $totaux['remise'],
                $totaux['total']
            ]);

            $commandeId = $this->db->lastInsertId();

            // Copier les articles du panier vers commande_articles
            // CORRECTION: Ajouter les champs NOT NULL manquants: reference_produit, image_produit, prix_final
            foreach ($items as $item) {
                $prixUnitaire = $item['prix_vente'];
                $prixPromo = $item['prix_promo'] ?? null;
                $prixFinal = $prixPromo ?? $prixUnitaire;
                $sousTotal = $prixFinal * $item['quantite'];

                // Récupérer les détails complets du produit pour la référence et l'image
                $produitDetail = $this->db->queryOne(
                    "SELECT reference_interne,
                            (SELECT url FROM images_produits WHERE produit_id = ? AND est_principale = TRUE LIMIT 1) as image_principale
                     FROM produits WHERE id = ?",
                    [$item['produit_id'], $item['produit_id']]
                );

                $sqlItem = "INSERT INTO commande_articles (
                    commande_id, produit_id, variante_id,
                    reference_produit, nom_produit, image_produit,
                    quantite, prix_unitaire, prix_promo, prix_final, sous_total,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

                $this->db->execute($sqlItem, [
                    $commandeId,
                    $item['produit_id'],
                    $item['variante_id'],
                    $produitDetail['reference_interne'] ?? 'REF-' . $item['produit_id'],
                    $item['nom'],
                    $produitDetail['image_principale'] ?? $item['image_url'],
                    $item['quantite'],
                    $prixUnitaire,
                    $prixPromo,
                    $prixFinal,
                    $sousTotal
                ]);

                // Décrémenter le stock
                $produitModel = new Produit();
                $produitModel->decrementStock($item['produit_id'], $item['quantite']);
            }

            // Marquer le panier comme converti
            $panierModel->convertToOrder($panierId);

            $this->db->commit();

            return $this->findByNumero($numeroCommande);

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Mettre à jour le statut
     */
    public function updateStatut($id, $nouveauStatut) {
        $statutsValides = ['en_attente', 'confirmee', 'en_preparation', 'expedie', 'en_livraison', 'livree', 'annulee', 'remboursee'];

        if (!in_array($nouveauStatut, $statutsValides)) {
            throw new Exception("Statut invalide");
        }

        $sql = "UPDATE commandes SET statut = ?, updated_at = NOW() WHERE id = ?";
        $result = $this->db->execute($sql, [$nouveauStatut, $id]);

        // TODO: Envoyer notification au client

        return $result;
    }

    /**
     * Annuler une commande
     */
    public function cancel($id, $clientId, $raison = null) {
        $commande = $this->find($id);

        if (!$commande || $commande['client_id'] != $clientId) {
            throw new Exception("Commande introuvable");
        }

        // Vérifier si la commande peut être annulée
        if (!in_array($commande['statut'], ['en_attente', 'confirmee'])) {
            throw new Exception("Cette commande ne peut plus être annulée");
        }

        $this->db->beginTransaction();

        try {
            // Restaurer le stock
            $items = $this->getItems($id);
            $produitModel = new Produit();

            foreach ($items as $item) {
                // Réaugmenter le stock
                $this->db->execute(
                    "UPDATE produits SET quantite_stock = quantite_stock + ? WHERE id = ? AND stock_illimite = FALSE",
                    [$item['quantite'], $item['produit_id']]
                );
            }

            // Annuler la commande
            $this->db->execute(
                "UPDATE commandes SET statut = 'annulee', raison_annulation = ?, updated_at = NOW() WHERE id = ?",
                [$raison, $id]
            );

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Obtenir les statistiques commandes client
     */
    public function getClientStats($clientId) {
        $stats = $this->db->queryOne(
            "SELECT
                COUNT(*) as total_commandes,
                SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut IN ('confirmee', 'en_preparation', 'expedie', 'en_livraison') THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut = 'livree' THEN 1 ELSE 0 END) as livrees,
                SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees,
                SUM(total) as montant_total
             FROM commandes
             WHERE client_id = ?",
            [$clientId]
        );

        return $stats;
    }

    /**
     * Rechercher des commandes
     */
    public function search($query, $filters = [], $limit = 20, $offset = 0) {
        $sql = "SELECT c.*, cl.nom, cl.prenom, cl.email
                FROM commandes c
                JOIN clients cl ON c.client_id = cl.id
                WHERE (c.numero LIKE ? OR cl.email LIKE ? OR cl.telephone LIKE ?)";

        $searchTerm = "%$query%";
        $params = [$searchTerm, $searchTerm, $searchTerm];

        if (isset($filters['statut'])) {
            $sql .= " AND c.statut = ?";
            $params[] = $filters['statut'];
        }

        $sql .= " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->query($sql, $params);
    }

    /**
     * Mettre à jour le tracking
     */
    public function updateTracking($id, $numeroSuivi) {
        // CORRECTION: La BDD a "numero_tracking" pas "numero_suivi" ni "transporteur"
        return $this->db->execute(
            "UPDATE commandes SET numero_tracking = ?, updated_at = NOW() WHERE id = ?",
            [$numeroSuivi, $id]
        );
    }
}

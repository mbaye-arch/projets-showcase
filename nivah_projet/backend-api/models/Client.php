<?php
/**
 * Modèle Client
 */

class Client {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouver un client par ID
     */
    public function find($id) {
        return $this->db->queryOne(
            "SELECT * FROM clients WHERE id = ?",
            [$id]
        );
    }

    /**
     * Trouver un client par email
     */
    public function findByEmail($email) {
        return $this->db->queryOne(
            "SELECT * FROM clients WHERE email = ?",
            [$email]
        );
    }

    /**
     * Trouver un client par téléphone
     */
    public function findByTelephone($telephone) {
        return $this->db->queryOne(
            "SELECT * FROM clients WHERE telephone = ?",
            [$telephone]
        );
    }

    /**
     * Créer un nouveau client
     */
    public function create($data) {
        $sql = "INSERT INTO clients (
            nom, prenom, email, telephone, mot_de_passe,
            adresse, ville, village, quartier,
            region, departement, commune, sexe,
            code_verification, code_expiration,
            statut, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $this->db->execute($sql, [
            $data['nom'],
            $data['prenom'],
            $data['email'],
            $data['telephone'],
            $data['mot_de_passe'], // Déjà hashé
            $data['adresse'] ?? '',
            $data['ville'] ?? '',
            $data['village'] ?? null,
            $data['quartier'] ?? '',
            $data['region'] ?? null,
            $data['departement'] ?? null,
            $data['commune'] ?? null,
            $data['sexe'] ?? 'autre',
            $data['code_verification'] ?? null,
            $data['code_expiration'] ?? null,
            $data['statut'] ?? 'en_attente'
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Mettre à jour un client
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }

        $values[] = $id;

        $sql = "UPDATE clients SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, $values);
    }

    /**
     * Vérifier l'email
     */
    public function verifyEmail($id) {
        return $this->db->execute(
            "UPDATE clients SET email_verifie = TRUE, statut = 'actif', updated_at = NOW() WHERE id = ?",
            [$id]
        );
    }

    /**
     * Mettre à jour la dernière connexion
     */
    public function updateLastLogin($id, $ipAddress = null) {
        return $this->db->execute(
            "UPDATE clients SET derniere_connexion = NOW(), last_ip_address = ? WHERE id = ?",
            [$ipAddress, $id]
        );
    }

    /**
     * Incrémenter les tentatives de connexion échouées
     */
    public function incrementFailedAttempts($id) {
        $this->db->execute(
            "UPDATE clients SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?",
            [$id]
        );

        // Bloquer le compte après 10 tentatives
        $client = $this->find($id);
        if ($client['failed_login_attempts'] >= 10) {
            $this->lockAccount($id, 30); // Bloquer 30 minutes
        }
    }

    /**
     * Réinitialiser les tentatives de connexion
     */
    public function resetFailedAttempts($id) {
        return $this->db->execute(
            "UPDATE clients SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = ?",
            [$id]
        );
    }

    /**
     * Bloquer un compte
     */
    public function lockAccount($id, $minutes = 30) {
        return $this->db->execute(
            "UPDATE clients SET account_locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?",
            [$minutes, $id]
        );
    }

    /**
     * Vérifier si le compte est bloqué
     */
    public function isLocked($id) {
        $client = $this->find($id);
        if (!$client || !$client['account_locked_until']) {
            return false;
        }

        return strtotime($client['account_locked_until']) > time();
    }

    /**
     * Rechercher des clients (admin)
     */
    public function search($query, $limit = 20, $offset = 0) {
        $sql = "SELECT * FROM clients
                WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR telephone LIKE ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?";

        $searchTerm = "%$query%";
        return $this->db->query($sql, [
            $searchTerm,
            $searchTerm,
            $searchTerm,
            $searchTerm,
            $limit,
            $offset
        ]);
    }

    /**
     * Compter le nombre total de clients
     */
    public function count($filters = []) {
        $sql = "SELECT COUNT(*) as total FROM clients WHERE 1=1";
        $params = [];

        if (isset($filters['statut'])) {
            $sql .= " AND statut = ?";
            $params[] = $filters['statut'];
        }

        if (isset($filters['ville'])) {
            $sql .= " AND ville = ?";
            $params[] = $filters['ville'];
        }

        $result = $this->db->queryOne($sql, $params);
        return $result['total'];
    }

    /**
     * Supprimer un client (soft delete)
     */
    public function delete($id) {
        return $this->db->execute(
            "UPDATE clients SET statut = 'inactif', updated_at = NOW() WHERE id = ?",
            [$id]
        );
    }

    /**
     * Supprimer définitivement
     */
    public function forceDelete($id) {
        return $this->db->execute(
            "DELETE FROM clients WHERE id = ?",
            [$id]
        );
    }
}

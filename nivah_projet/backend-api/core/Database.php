<?php
/**
 * Classe Database - Gestion connexion MySQL
 */

class Database {
    private static $instance = null;
    private $connection;

    /**
     * Constructeur privé (Singleton)
     */
    private function __construct() {
        $config = Config::database();

        try {
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";

            $this->connection = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log("Erreur connexion DB: " . $e->getMessage());
            throw new Exception("Impossible de se connecter à la base de données");
        }
    }

    /**
     * Obtenir l'instance unique (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Obtenir la connexion PDO
     */
    public function getConnection() {
        return $this->connection;
    }

    /**
     * Exécuter une requête SELECT
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erreur requête: " . $e->getMessage());
            throw new Exception("Erreur lors de l'exécution de la requête");
        }
    }

    /**
     * Exécuter une requête SELECT (une seule ligne)
     */
    public function queryOne($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Erreur requête: " . $e->getMessage());
            throw new Exception("Erreur lors de l'exécution de la requête");
        }
    }

    /**
     * Exécuter une requête INSERT/UPDATE/DELETE
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Erreur exécution: " . $e->getMessage());
            throw new Exception("Erreur lors de l'exécution de la commande");
        }
    }

    /**
     * Obtenir le dernier ID inséré
     */
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }

    /**
     * Commencer une transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Valider une transaction
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Annuler une transaction
     */
    public function rollback() {
        return $this->connection->rollback();
    }

    /**
     * Échapper une valeur pour SQL (utiliser les requêtes préparées de préférence)
     */
    public function escape($value) {
        return $this->connection->quote($value);
    }
}

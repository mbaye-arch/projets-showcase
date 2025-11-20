<?php
/**
 * Configuration Nivah API
 * Charge les variables d'environnement depuis .env
 */

class Config {
    private static $config = [];
    private static $loaded = false;

    /**
     * Charger la configuration depuis .env
     */
    public static function load() {
        if (self::$loaded) {
            return;
        }

        $envFile = dirname(__DIR__, 1) . '/.env';

        if (!file_exists($envFile)) {
            throw new Exception("Fichier .env introuvable");
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            // Ignorer les commentaires
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parser la ligne KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Enlever les guillemets
                $value = trim($value, '"\'');

                self::$config[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    /**
     * Récupérer une valeur de configuration
     *
     * @param string $key Clé de configuration
     * @param mixed $default Valeur par défaut
     * @return mixed
     */
    public static function get($key, $default = null) {
        if (!self::$loaded) {
            self::load();
        }

        return self::$config[$key] ?? $default;
    }

    /**
     * Vérifier si une clé existe
     */
    public static function has($key) {
        if (!self::$loaded) {
            self::load();
        }

        return isset(self::$config[$key]);
    }

    /**
     * Configuration base de données
     */
    public static function database() {
        return [
            'host' => self::get('DB_HOST', 'localhost'),
            'port' => self::get('DB_PORT', 3306),
            'database' => self::get('DB_DATABASE'),
            'username' => self::get('DB_USERNAME'),
            'password' => self::get('DB_PASSWORD'),
            'charset' => 'utf8mb4'
        ];
    }

    /**
     * Configuration Auth (Sessions simples)
     */
    public static function auth() {
        return [
            'token_lifetime' => 7 * 24 * 60 * 60, // 7 jours en secondes
            'session_name' => 'nivah_session',
            'remember_me_lifetime' => 30 * 24 * 60 * 60 // 30 jours
        ];
    }

    /**
     * Configuration email
     */
    public static function mail() {
        return [
            'host' => self::get('MAIL_HOST'),
            'port' => (int)self::get('MAIL_PORT', 465),
            'username' => self::get('MAIL_USERNAME'),
            'password' => self::get('MAIL_PASSWORD'),
            'encryption' => self::get('MAIL_ENCRYPTION', 'ssl'),
            'from_address' => self::get('MAIL_FROM_ADDRESS'),
            'from_name' => self::get('MAIL_FROM_NAME', 'Nivah')
        ];
    }

    /**
     * Configuration Paydunya
     */
    public static function paydunya() {
        return [
            'mode' => self::get('PAYDUNYA_MODE', 'test'),
            'master_key' => self::get('PAYDUNYA_MASTER_KEY'),
            'public_key' => self::get('PAYDUNYA_PUBLIC_KEY'),
            'private_key' => self::get('PAYDUNYA_PRIVATE_KEY'),
            'token' => self::get('PAYDUNYA_TOKEN'),
            'store_name' => self::get('PAYDUNYA_STORE_NAME'),
            'store_website' => self::get('PAYDUNYA_STORE_WEBSITE'),
            'ipn_url' => self::get('PAYDUNYA_IPN_URL')
        ];
    }

    /**
     * URL de l'application
     */
    public static function appUrl() {
        return self::get('APP_URL', 'http://localhost');
    }

    /**
     * Mode debug
     */
    public static function isDebug() {
        return self::get('APP_DEBUG', 'false') === 'true';
    }
}

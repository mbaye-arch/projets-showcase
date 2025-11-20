<?php
/**
 * Classe JWT - Gestion des tokens d'authentification
 * Implémentation simple JWT (sans bibliothèque externe)
 */

class JWT {

    /**
     * Générer un token JWT
     */
    public static function encode($payload, $secret = null) {
        if ($secret === null) {
            $secret = Config::get('JWT_SECRET');
            if (!$secret) {
                throw new Exception("JWT_SECRET non défini");
            }
        }

        // Header
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        // Ajouter timestamps
        $payload['iat'] = time(); // Issued At
        $payload['exp'] = time() + Config::get('JWT_TTL', 10080) * 60; // Expiration (en secondes)

        // Encoder
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        // Signature
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }

    /**
     * Décoder et valider un token JWT
     */
    public static function decode($token, $secret = null) {
        if ($secret === null) {
            $secret = Config::get('JWT_SECRET');
            if (!$secret) {
                throw new Exception("JWT_SECRET non défini");
            }
        }

        // Séparer les parties
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new Exception("Token JWT invalide");
        }

        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

        // Vérifier la signature
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);

        if (!hash_equals($expectedSignature, $signature)) {
            throw new Exception("Signature JWT invalide");
        }

        // Décoder le payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        if (!$payload) {
            throw new Exception("Payload JWT invalide");
        }

        // Vérifier l'expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception("Token JWT expiré");
        }

        return $payload;
    }

    /**
     * Obtenir le token depuis les headers
     */
    public static function getTokenFromHeaders() {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            // Format: "Bearer TOKEN"
            $auth = $headers['Authorization'];

            if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Obtenir le payload du token depuis les headers
     */
    public static function getPayloadFromRequest() {
        $token = self::getTokenFromHeaders();

        if (!$token) {
            return null;
        }

        try {
            return self::decode($token);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    public static function check() {
        return self::getPayloadFromRequest() !== null;
    }

    /**
     * Obtenir l'utilisateur authentifié
     */
    public static function user() {
        $payload = self::getPayloadFromRequest();
        return $payload ? $payload : null;
    }

    /**
     * Encoder en Base64 URL-safe
     */
    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * Décoder depuis Base64 URL-safe
     */
    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;

        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }

        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    /**
     * Générer un JWT secret aléatoire (à utiliser une fois)
     */
    public static function generateSecret($length = 64) {
        return bin2hex(random_bytes($length));
    }
}

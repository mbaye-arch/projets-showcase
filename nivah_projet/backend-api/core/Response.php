<?php
/**
 * Classe Response - Gestion des réponses API JSON
 */

class Response {

    /**
     * Envoyer une réponse JSON de succès
     */
    public static function success($data = null, $message = null, $code = 200) {
        self::send([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Envoyer une réponse JSON d'erreur
     */
    public static function error($message, $code = 400, $errors = null) {
        self::send([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $code);
    }

    /**
     * Envoyer une réponse JSON avec validation errors
     */
    public static function validationError($errors, $message = "Erreur de validation") {
        self::send([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422);
    }

    /**
     * Envoyer une réponse non autorisé
     */
    public static function unauthorized($message = "Non autorisé") {
        self::send([
            'success' => false,
            'message' => $message
        ], 401);
    }

    /**
     * Envoyer une réponse forbidden
     */
    public static function forbidden($message = "Accès refusé") {
        self::send([
            'success' => false,
            'message' => $message
        ], 403);
    }

    /**
     * Envoyer une réponse not found
     */
    public static function notFound($message = "Ressource introuvable") {
        self::send([
            'success' => false,
            'message' => $message
        ], 404);
    }

    /**
     * Envoyer une réponse serveur erreur
     */
    public static function serverError($message = "Erreur serveur") {
        self::send([
            'success' => false,
            'message' => $message
        ], 500);
    }

    /**
     * Fonction privée pour envoyer la réponse
     */
    private static function send($data, $code = 200) {
        // Définir le code de statut HTTP
        http_response_code($code);

        // Définir les headers
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Filtrer les valeurs null du tableau data
        $filtered = self::filterNull($data);

        // Encoder et envoyer
        echo json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Filtrer les valeurs null d'un tableau
     */
    private static function filterNull($array) {
        if (!is_array($array)) {
            return $array;
        }

        return array_filter($array, function($value) {
            return $value !== null;
        });
    }

    /**
     * Obtenir le corps de la requête JSON
     */
    public static function getBody() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }

    /**
     * Valider les champs requis
     */
    public static function validateRequired($data, $requiredFields) {
        $errors = [];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[$field] = "Le champ $field est requis";
            }
        }

        return empty($errors) ? null : $errors;
    }
}

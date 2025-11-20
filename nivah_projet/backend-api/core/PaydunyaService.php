<?php
/**
 * Service d'intégration Paydunya
 * Documentation: https://paydunya.com/developers
 */

class PaydunyaService {
    private $masterKey;
    private $publicKey;
    private $privateKey;
    private $token;
    private $mode; // 'test' ou 'live'
    private $baseUrl;

    public function __construct() {
        $this->masterKey = Config::get('PAYDUNYA_MASTER_KEY');
        $this->publicKey = Config::get('PAYDUNYA_PUBLIC_KEY');
        $this->privateKey = Config::get('PAYDUNYA_PRIVATE_KEY');
        $this->token = Config::get('PAYDUNYA_TOKEN');
        $this->mode = Config::get('PAYDUNYA_MODE', 'live');

        // URL de l'API selon le mode
        $this->baseUrl = $this->mode === 'test'
            ? 'https://app.paydunya.com/sandbox-api/v1'
            : 'https://app.paydunya.com/api/v1';
    }

    /**
     * Créer une facture de paiement
     */
    public function createInvoice($commande, $client) {
        // Préparer les données
        $invoiceData = [
            'invoice' => [
                'total_amount' => $commande['montant_total'],
                'description' => 'Commande ' . $commande['numero']
            ],
            'store' => [
                'name' => Config::get('APP_NAME', 'Nivah'),
                'tagline' => 'Marketplace multi-boutiques',
                'phone' => Config::get('APP_PHONE', '+221700000000'),
                'logo_url' => Config::get('APP_URL', 'https://nivah.com') . '/assets/logo.png',
                'website_url' => Config::get('APP_URL', 'https://nivah.com')
            ],
            'actions' => [
                'cancel_url' => Config::get('APP_URL') . '/commandes/' . $commande['numero'] . '?payment=cancelled',
                'return_url' => Config::get('APP_URL') . '/commandes/' . $commande['numero'] . '?payment=success',
                'callback_url' => Config::get('API_URL', 'https://api.example.invalid') . '/webhooks/paydunya'
            ],
            'custom_data' => [
                'commande_id' => $commande['id'],
                'commande_numero' => $commande['numero'],
                'client_id' => $client['id']
            ]
        ];

        // Ajouter les informations client
        $invoiceData['customer'] = [
            'name' => $client['prenom'] . ' ' . $client['nom'],
            'phone' => $client['telephone'],
            'email' => $client['email']
        ];

        // Ajouter les articles de la commande (optionnel mais recommandé)
        $db = Database::getInstance();
        $items = $db->query(
            "SELECT ci.*, p.nom as produit_nom
             FROM commande_items ci
             JOIN produits p ON ci.produit_id = p.id
             WHERE ci.commande_id = ?",
            [$commande['id']]
        );

        $invoiceData['items'] = [];
        foreach ($items as $item) {
            $invoiceData['items'][] = [
                'name' => $item['produit_nom'],
                'quantity' => $item['quantite'],
                'unit_price' => $item['prix_unitaire'],
                'total_price' => $item['prix_total']
            ];
        }

        // Appeler l'API Paydunya
        $response = $this->makeRequest('/checkout-invoice/create', $invoiceData);

        if (!$response['success']) {
            throw new Exception($response['message'] ?? 'Erreur lors de la création de la facture Paydunya');
        }

        return [
            'token' => $response['token'],
            'response_code' => $response['response_code'],
            'response_text' => $response['response_text'],
            'checkout_url' => $response['response_text'] // URL de paiement
        ];
    }

    /**
     * Vérifier le statut d'une transaction
     */
    public function checkTransactionStatus($token) {
        $response = $this->makeRequest('/checkout-invoice/confirm/' . $token, [], 'GET');

        if (!$response['success']) {
            throw new Exception('Erreur lors de la vérification du statut');
        }

        return [
            'status' => $response['status'], // 'completed', 'pending', 'cancelled'
            'transaction_id' => $response['transaction_id'] ?? null,
            'custom_data' => $response['custom_data'] ?? [],
            'response' => $response
        ];
    }

    /**
     * Faire une requête HTTP vers l'API Paydunya
     */
    private function makeRequest($endpoint, $data = [], $method = 'POST') {
        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Content-Type: application/json',
            'PAYDUNYA-MASTER-KEY: ' . $this->masterKey,
            'PAYDUNYA-PRIVATE-KEY: ' . $this->privateKey,
            'PAYDUNYA-TOKEN: ' . $this->token
        ];

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            error_log("Erreur Paydunya cURL: " . $error);
            return [
                'success' => false,
                'message' => 'Erreur de connexion à Paydunya'
            ];
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200) {
            error_log("Erreur Paydunya HTTP $httpCode: " . $response);
            return [
                'success' => false,
                'message' => $result['message'] ?? 'Erreur lors de la communication avec Paydunya',
                'response' => $result
            ];
        }

        return array_merge(['success' => true], $result);
    }

    /**
     * Valider le webhook Paydunya (vérifier la signature)
     */
    public static function validateWebhook($payload) {
        // Paydunya envoie un hash HMAC dans les headers
        $signature = isset($_SERVER['HTTP_X_PAYDUNYA_SIGNATURE']) ? $_SERVER['HTTP_X_PAYDUNYA_SIGNATURE'] : null;

        if (!$signature) {
            return false;
        }

        // Calculer le hash attendu
        $masterKey = Config::get('PAYDUNYA_MASTER_KEY');
        $computedHash = hash_hmac('sha256', json_encode($payload), $masterKey);

        return hash_equals($computedHash, $signature);
    }

    /**
     * Récupérer l'URL de paiement pour une facture
     */
    public static function getCheckoutUrl($token) {
        $mode = Config::get('PAYDUNYA_MODE', 'live');

        if ($mode === 'test') {
            return 'https://app.paydunya.com/sandbox-checkout/' . $token;
        }

        return 'https://app.paydunya.com/checkout/' . $token;
    }
}

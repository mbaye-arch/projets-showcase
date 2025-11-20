<?php
/**
 * Webhook Paydunya - Confirmation de paiement
 * URL: https://api.example.invalid/webhooks/paydunya
 */

// Charger les dépendances
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../core/Database.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/PaydunyaService.php';
require_once __DIR__ . '/../../models/Commande.php';
require_once __DIR__ . '/../../models/Client.php';
require_once __DIR__ . '/../../core/Mailer.php';

Config::load();

// Log de la requête (pour debugging)
$rawInput = file_get_contents('php://input');
error_log("Webhook Paydunya reçu: " . $rawInput);

// Récupérer les données du webhook
$payload = json_decode($rawInput, true);

if (!$payload) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload']);
    exit;
}

// Valider la signature du webhook
if (!PaydunyaService::validateWebhook($payload)) {
    error_log("Webhook Paydunya: Signature invalide");
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

try {
    $db = Database::getInstance();
    $commandeModel = new Commande();
    $clientModel = new Client();

    // Extraire les informations
    $status = $payload['status'] ?? null; // 'completed', 'pending', 'cancelled'
    $transactionId = $payload['transaction_id'] ?? null;
    $customData = $payload['custom_data'] ?? [];
    $commandeId = $customData['commande_id'] ?? null;

    if (!$commandeId) {
        error_log("Webhook Paydunya: commande_id manquant");
        http_response_code(400);
        echo json_encode(['error' => 'Missing commande_id']);
        exit;
    }

    // Récupérer la commande
    $commande = $commandeModel->find($commandeId);

    if (!$commande) {
        error_log("Webhook Paydunya: Commande $commandeId introuvable");
        http_response_code(404);
        echo json_encode(['error' => 'Commande not found']);
        exit;
    }

    // Traiter selon le statut
    switch ($status) {
        case 'completed':
            // Paiement réussi
            $db->execute(
                "UPDATE commandes SET
                    statut = 'confirmee',
                    statut_paiement = 'paye',
                    transaction_id = ?,
                    date_paiement = NOW(),
                    updated_at = NOW()
                 WHERE id = ?",
                [$transactionId, $commandeId]
            );

            // Mettre à jour le stock
            $commandeModel->decrementStock($commandeId);

            // Récupérer le client
            $client = $clientModel->find($commande['client_id']);

            // Envoyer l'email de confirmation
            $commande = $commandeModel->find($commandeId);
            Mailer::sendOrderConfirmation($commande, $client);

            error_log("Webhook Paydunya: Paiement confirmé pour commande $commandeId");
            break;

        case 'cancelled':
            // Paiement annulé
            $db->execute(
                "UPDATE commandes SET
                    statut = 'annulee',
                    statut_paiement = 'echoue',
                    transaction_id = ?,
                    updated_at = NOW()
                 WHERE id = ?",
                [$transactionId, $commandeId]
            );

            error_log("Webhook Paydunya: Paiement annulé pour commande $commandeId");
            break;

        case 'pending':
            // Paiement en attente
            $db->execute(
                "UPDATE commandes SET
                    statut_paiement = 'en_attente',
                    transaction_id = ?,
                    updated_at = NOW()
                 WHERE id = ?",
                [$transactionId, $commandeId]
            );

            error_log("Webhook Paydunya: Paiement en attente pour commande $commandeId");
            break;

        default:
            error_log("Webhook Paydunya: Statut inconnu: $status");
            break;
    }

    // Répondre à Paydunya
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Webhook processed successfully'
    ]);

} catch (Exception $e) {
    error_log("Erreur webhook Paydunya: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error'
    ]);
}

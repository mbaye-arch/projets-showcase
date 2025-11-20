<?php
$typeIcons = [
    'support' => '💬',
    'reclamation' => '⚠️',
    'question_produit' => '❓',
    'question_livraison' => '🚚',
    'remboursement' => '💰',
    'retour_echange' => '🔄',
    'autre' => '📝'
];

$icon = $typeIcons[$demande['type']] ?? '📋';

$emailContent = <<<HTML
<div class="greeting">
    Bonjour {$prenom}! {$icon}
</div>

<div class="content">
    <p>Nous avons bien reçu votre demande de support et notre équipe la traite avec attention.</p>

    <div class="info-box">
        <h3>📋 Informations de votre demande</h3>
        <p><strong>Numéro:</strong> {$demande['numero']}</p>
        <p><strong>Type:</strong> {$demande['type']}</p>
        <p><strong>Sujet:</strong> {$demande['sujet']}</p>
        <p><strong>Priorité:</strong> {$demande['priorite']}</p>
        <p><strong>Date:</strong> {$demande['created_at']}</p>
    </div>

    <div class="info-box">
        <h3>💬 Votre message</h3>
        <p style="white-space: pre-wrap;">{$demande['message']}</p>
    </div>
HTML;

// SLA selon la priorité
$slaMessages = [
    'urgente' => 'Nous vous répondrons dans les <strong>2 heures</strong>',
    'haute' => 'Nous vous répondrons dans les <strong>4 heures</strong>',
    'normale' => 'Nous vous répondrons dans les <strong>24 heures</strong>',
    'basse' => 'Nous vous répondrons dans les <strong>48 heures</strong>'
];

$slaMessage = $slaMessages[$demande['priorite']] ?? 'Nous vous répondrons dans les meilleurs délais';

$emailContent .= <<<HTML
    <div class="info-box" style="border-left-color: #28a745;">
        <h3>⏱️ Délai de réponse</h3>
        <p>{$slaMessage}</p>
    </div>

    <p>Vous recevrez une notification par email dès qu'un membre de notre équipe répondra à votre demande.</p>

    <p style="text-align: center; margin-top: 30px;">
        <a href="https://nivah.com/demandes/{$demande['numero']}" class="button">Voir ma demande</a>
    </p>
</div>

<div class="divider"></div>

<div class="content" style="font-size: 14px; color: #777;">
    <p><strong>Besoin d'aide immédiate?</strong></p>
    <p>📞 Appelez-nous: +221 70 000 00 00</p>
    <p>📧 Email: support@example.invalid</p>
</div>
HTML;

include __DIR__ . '/layout.php';
?>

<?php
$emailContent = <<<HTML
<div class="greeting">
    Bonjour {$prenom}! 🎉
</div>

<div class="content">
    <p>Merci pour votre commande! Nous sommes ravis de vous confirmer que votre commande <strong>#{$commande['numero']}</strong> a été enregistrée avec succès.</p>

    <div class="info-box">
        <h3>📦 Informations de commande</h3>
        <p><strong>Numéro:</strong> {$commande['numero']}</p>
        <p><strong>Date:</strong> {$commande['created_at']}</p>
        <p><strong>Statut:</strong> {$commande['statut']}</p>
        <p><strong>Mode de paiement:</strong> {$commande['mode_paiement']}</p>
    </div>

    <div class="order-details">
        <h3>Récapitulatif de votre commande</h3>
        <div class="order-item">
            <span>Sous-total</span>
            <span>{$commande['montant_ht']} FCFA</span>
        </div>
        <div class="order-item">
            <span>Frais de livraison</span>
            <span>{$commande['frais_livraison']} FCFA</span>
        </div>
        <div class="order-item">
            <span>TVA</span>
            <span>{$commande['montant_tva']} FCFA</span>
        </div>
        <div class="total">
            <span>Total</span>
            <span>{$commande['montant_total']} FCFA</span>
        </div>
    </div>

    <div class="info-box">
        <h3>🚚 Adresse de livraison</h3>
        <p>{$commande['adresse_livraison']}</p>
    </div>

    <p style="text-align: center; margin-top: 30px;">
        <a href="{$tracking_url}" class="button">Suivre ma commande</a>
    </p>
</div>

<div class="divider"></div>

<div class="content" style="font-size: 14px; color: #777;">
    <p>Vous recevrez un email de confirmation dès que votre commande sera expédiée.</p>
    <p>Pour toute question, n'hésitez pas à nous contacter à support@example.invalid</p>
</div>
HTML;

include __DIR__ . '/layout.php';
?>

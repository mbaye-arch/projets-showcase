<?php
$emailContent = <<<HTML
<div class="greeting">
    Bonjour {$prenom} {$nom}! 👋
</div>

<div class="content">
    <p>Bienvenue sur <strong>Nivah</strong>, votre nouvelle marketplace multi-boutiques!</p>

    <p>Nous sommes ravis de vous compter parmi nous. Votre compte a été créé avec succès et vous pouvez dès maintenant:</p>

    <div class="info-box">
        <h3>🛍️ Découvrir nos boutiques</h3>
        <p>Explorez des centaines de produits de marques premium</p>
    </div>

    <div class="info-box">
        <h3>❤️ Sauvegarder vos favoris</h3>
        <p>Créez votre liste de produits préférés</p>
    </div>

    <div class="info-box">
        <h3>🚀 Commander en toute sécurité</h3>
        <p>Paiement sécurisé et livraison rapide</p>
    </div>

    <p style="text-align: center; margin-top: 30px;">
        <a href="https://nivah.com/boutiques" class="button">Commencer mes achats</a>
    </p>
</div>

<div class="divider"></div>

<div class="content" style="font-size: 14px; color: #777;">
    <p><strong>Informations de votre compte:</strong></p>
    <p>📧 Email: {$email}</p>
    <p>⚡ Compte activé et prêt à l'emploi</p>
</div>
HTML;

include __DIR__ . '/layout.php';
?>

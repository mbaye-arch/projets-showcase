<?php
$emailContent = <<<HTML
<div class="greeting">
    Bonjour {$prenom}! 🔐
</div>

<div class="content">
    <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Nivah</strong>.</p>

    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>

    <p style="text-align: center; margin: 30px 0;">
        <a href="{$reset_url}" class="button">Réinitialiser mon mot de passe</a>
    </p>

    <div class="info-box">
        <h3>⚠️ Important</h3>
        <p>Ce lien est valide jusqu'au: <strong>{$valid_until}</strong></p>
        <p>Pour votre sécurité, il expirera après 1 heure.</p>
    </div>

    <p style="font-size: 14px; color: #777;">
        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:<br>
        <a href="{$reset_url}" style="color: #667eea; word-break: break-all;">{$reset_url}</a>
    </p>
</div>

<div class="divider"></div>

<div class="content" style="font-size: 14px; color: #999;">
    <p><strong>Vous n'avez pas demandé cette réinitialisation?</strong></p>
    <p>Ignorez simplement cet email. Votre mot de passe ne sera pas modifié.</p>
</div>
HTML;

include __DIR__ . '/layout.php';
?>

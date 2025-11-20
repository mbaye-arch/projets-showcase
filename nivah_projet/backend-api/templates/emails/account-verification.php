<?php
$emailContent = <<<HTML
<div class="greeting">
    Bonjour {$prenom} {$nom}! 👋
</div>

<div class="content">
    <p>Merci de vous être inscrit sur <strong>Nivah</strong>!</p>

    <p>Pour activer votre compte et profiter de toutes nos fonctionnalités, veuillez vérifier votre adresse email en utilisant le code ci-dessous:</p>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; opacity: 0.9;">Code de vérification</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px;">{$code_verification}</p>
    </div>

    <div class="info-box">
        <h3>⚠️ Important</h3>
        <p>Ce code est valable pendant <strong>24 heures</strong></p>
        <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    </div>

    <p>Vous pouvez également activer votre compte en cliquant sur le bouton ci-dessous:</p>

    <p style="text-align: center; margin-top: 30px;">
        <a href="{$activation_url}" class="button">Activer mon compte</a>
    </p>
</div>

<div class="divider"></div>

<div class="content" style="font-size: 14px; color: #777;">
    <p><strong>Pourquoi vérifier mon email?</strong></p>
    <p>✅ Sécurise votre compte</p>
    <p>✅ Permet la récupération de mot de passe</p>
    <p>✅ Recevez des notifications importantes</p>
</div>
HTML;

include __DIR__ . '/layout.php';
?>

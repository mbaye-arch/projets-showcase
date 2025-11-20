<?php
/**
 * Service d'envoi d'emails pour Nivah
 *
 * Utilise PHPMailer et les templates dans templates/emails/
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $mailer;
    private $templatesPath;

    public function __construct() {
        $this->mailer = new PHPMailer(true);
        $this->templatesPath = __DIR__ . '/../templates/emails/';

        // Configuration SMTP (à adapter selon votre configuration)
        $this->mailer->isSMTP();
        $this->mailer->Host = getenv('SMTP_HOST') ?: 'smtp.example.invalid';
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = getenv('SMTP_USER') ?: 'noreply@example.invalid';
        $this->mailer->Password = getenv('SMTP_PASS') ?: '';
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = getenv('SMTP_PORT') ?: 587;
        $this->mailer->CharSet = 'UTF-8';

        // Expéditeur par défaut
        $this->mailer->setFrom(
            getenv('MAIL_FROM') ?: 'noreply@example.invalid',
            getenv('MAIL_FROM_NAME') ?: 'Nivah'
        );
    }

    /**
     * Envoyer un email de bienvenue
     */
    public function sendWelcomeEmail($userEmail, $userName) {
        try {
            $emailContent = $this->renderTemplate('welcome.php', [
                'userName' => $userName
            ]);

            $html = $this->renderLayout($emailContent, 'Bienvenue sur Nivah! 🎉');

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = 'Bienvenue sur Nivah! 🎉';
            $this->mailer->Body = $html;
            $this->mailer->isHTML(true);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Failed to send welcome email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer un code de vérification d'email
     */
    public function sendVerificationCode($userEmail, $userName, $code) {
        try {
            $emailContent = $this->renderTemplate('account-verification.php', [
                'userName' => $userName,
                'code' => $code
            ]);

            $html = $this->renderLayout($emailContent, 'Vérification de votre compte');

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = "Code de vérification: $code";
            $this->mailer->Body = $html;
            $this->mailer->isHTML(true);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Failed to send verification email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer un code de réinitialisation de mot de passe
     */
    public function sendPasswordResetCode($userEmail, $userName, $code) {
        try {
            $emailContent = $this->renderTemplate('password-reset.php', [
                'userName' => $userName,
                'code' => $code
            ]);

            $html = $this->renderLayout($emailContent, 'Réinitialisation de mot de passe');

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = "Code de réinitialisation: $code";
            $this->mailer->Body = $html;
            $this->mailer->isHTML(true);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Failed to send password reset email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer une confirmation de commande
     */
    public function sendOrderConfirmation($userEmail, $userName, $orderData) {
        try {
            $emailContent = $this->renderTemplate('order-confirmation.php', [
                'userName' => $userName,
                'order' => $orderData
            ]);

            $orderNumber = $orderData['numero_commande'];
            $html = $this->renderLayout($emailContent, "Commande #$orderNumber confirmée");

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = "✅ Commande #$orderNumber confirmée";
            $this->mailer->Body = $html;
            $this->mailer->isHTML(true);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Failed to send order confirmation email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer une notification de changement de statut de commande
     */
    public function sendOrderStatusUpdate($userEmail, $userName, $orderNumber, $newStatus, $orderId) {
        try {
            $statusMessages = [
                'confirmee' => ['emoji' => '✅', 'title' => 'Commande confirmée', 'message' => 'Votre commande a été confirmée.'],
                'en_cours' => ['emoji' => '📦', 'title' => 'En préparation', 'message' => 'Votre commande est en cours de préparation.'],
                'en_livraison' => ['emoji' => '🚚', 'title' => 'En livraison', 'message' => 'Votre commande est en cours de livraison!'],
                'livree' => ['emoji' => '🎉', 'title' => 'Livrée', 'message' => 'Votre commande a été livrée avec succès!'],
                'annulee' => ['emoji' => '❌', 'title' => 'Annulée', 'message' => 'Votre commande a été annulée.']
            ];

            $status = $statusMessages[$newStatus] ?? ['emoji' => 'ℹ️', 'title' => 'Mise à jour', 'message' => 'Statut mis à jour.'];

            $emailContent = "
                <div class='greeting'>Bonjour $userName,</div>
                <div class='content'>
                    <p>{$status['message']}</p>
                    <div class='info-box'>
                        <h3>Commande #{$orderNumber}</h3>
                        <p><strong>Nouveau statut:</strong> {$status['title']}</p>
                    </div>
                    <p>Vous pouvez suivre votre commande dans l'application Nivah.</p>
                </div>
            ";

            $html = $this->renderLayout($emailContent, "{$status['emoji']} {$status['title']}");

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = "{$status['emoji']} Commande #$orderNumber - {$status['title']}";
            $this->mailer->Body = $html;
            $this->mailer->isHTML(true);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Failed to send order status update email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer une demande au SAV
     */
    public function sendSupportRequest($userEmail, $userName, $subject, $message) {
        try {
            // Email au support
            $supportEmail = getenv('SUPPORT_EMAIL') ?: 'support@example.invalid';

            $supportContent = "
                <div class='greeting'>Nouvelle demande de support</div>
                <div class='content'>
                    <div class='info-box'>
                        <h3>Détails de la demande</h3>
                        <p><strong>De:</strong> $userName ($userEmail)</p>
                        <p><strong>Sujet:</strong> $subject</p>
                    </div>
                    <div class='order-details'>
                        <h3>Message:</h3>
                        <p>" . nl2br(htmlspecialchars($message)) . "</p>
                    </div>
                    <p><strong>Répondre à:</strong> <a href='mailto:$userEmail'>$userEmail</a></p>
                </div>
            ";

            $supportHtml = $this->renderLayout($supportContent, "🆘 Demande SAV - $subject");

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($supportEmail, 'Support Nivah');
            $this->mailer->Subject = "🆘 Demande SAV - $subject";
            $this->mailer->Body = $supportHtml;
            $this->mailer->addReplyTo($userEmail, $userName);
            $this->mailer->isHTML(true);

            $supportSent = $this->mailer->send();

            // Email de confirmation au client
            $clientContent = $this->renderTemplate('support-confirmation.php', [
                'userName' => $userName,
                'subject' => $subject,
                'message' => $message
            ]);

            $clientHtml = $this->renderLayout($clientContent, "✅ Demande reçue - $subject");

            $this->mailer->clearAddresses();
            $this->mailer->clearReplyTos();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = "✅ Votre demande a été reçue";
            $this->mailer->Body = $clientHtml;
            $this->mailer->isHTML(true);

            $clientSent = $this->mailer->send();

            return $supportSent && $clientSent;
        } catch (Exception $e) {
            error_log("Failed to send support request email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Rendre un template
     */
    private function renderTemplate($template, $data = []) {
        $templateFile = $this->templatesPath . $template;

        if (!file_exists($templateFile)) {
            throw new Exception("Template not found: $template");
        }

        extract($data);
        ob_start();
        include $templateFile;
        return ob_get_clean();
    }

    /**
     * Rendre le layout avec le contenu
     */
    private function renderLayout($emailContent, $subject = '') {
        $layoutFile = $this->templatesPath . 'layout.php';

        if (!file_exists($layoutFile)) {
            return $emailContent;
        }

        ob_start();
        include $layoutFile;
        return ob_get_clean();
    }

    /**
     * Générer un code de vérification (6 chiffres)
     */
    public static function generateCode() {
        return str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}

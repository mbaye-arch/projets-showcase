<?php
/**
 * Service d'envoi d'emails avec templates HTML
 * Utilise PHPMailer via SMTP
 */

class Mailer {
    private $mailer;
    private $from_email;
    private $from_name;

    public function __construct() {
        require_once __DIR__ . '/../vendor/phpmailer/PHPMailer.php';
        require_once __DIR__ . '/../vendor/phpmailer/SMTP.php';
        require_once __DIR__ . '/../vendor/phpmailer/Exception.php';

        $this->mailer = new PHPMailer\PHPMailer\PHPMailer(true);

        // Configuration SMTP
        $this->mailer->isSMTP();
        $this->mailer->Host = Config::get('MAIL_HOST');
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = Config::get('MAIL_USERNAME');
        $this->mailer->Password = Config::get('MAIL_PASSWORD');
        $this->mailer->SMTPSecure = Config::get('MAIL_ENCRYPTION', 'ssl');
        $this->mailer->Port = (int)Config::get('MAIL_PORT', 465);
        $this->mailer->CharSet = 'UTF-8';

        // Debug SMTP (0 = off, 1 = client, 2 = client and server)
        $this->mailer->SMTPDebug = 0;

        // Options supplémentaires pour SSL
        $this->mailer->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        // Expéditeur
        $this->from_email = Config::get('MAIL_FROM_ADDRESS', 'noreply@example.invalid');
        $this->from_name = Config::get('MAIL_FROM_NAME', 'Nivah');
    }

    /**
     * Charger un template HTML
     */
    private function loadTemplate($templateName, $variables = []) {
        $templatePath = __DIR__ . '/../templates/emails/' . $templateName . '.php';

        if (!file_exists($templatePath)) {
            throw new Exception("Template email introuvable: $templateName");
        }

        // Extraire les variables pour le template
        extract($variables);

        // Capturer le contenu du template
        ob_start();
        include $templatePath;
        $content = ob_get_clean();

        return $content;
    }

    /**
     * Envoyer un email
     */
    public function send($to, $subject, $templateName, $variables = []) {
        try {
            // Réinitialiser pour chaque envoi
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();

            // Configuration
            $this->mailer->setFrom($this->from_email, $this->from_name);
            $this->mailer->addAddress($to);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = $subject;

            // Charger le template
            $htmlContent = $this->loadTemplate($templateName, $variables);
            $this->mailer->Body = $htmlContent;

            // Version texte alternative
            $this->mailer->AltBody = strip_tags($htmlContent);

            // Envoyer
            $result = $this->mailer->send();

            // Log de succès
            error_log("Email envoyé avec succès à: $to - Sujet: $subject");

            return $result;

        } catch (Exception $e) {
            // Log détaillé de l'erreur
            error_log("❌ Erreur envoi email à $to: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());

            // Si c'est une erreur SMTP, logger les détails
            if (isset($this->mailer->ErrorInfo)) {
                error_log("SMTP ErrorInfo: " . $this->mailer->ErrorInfo);
            }

            // Ne pas bloquer l'application si l'email échoue
            return false;
        }
    }

    /**
     * Email de vérification de compte
     */
    public static function sendAccountVerification($client, $codeVerification) {
        $mailer = new self();

        $activationUrl = Config::get('APP_URL', 'https://nivah.com') . '/verify-email?code=' . $codeVerification . '&email=' . urlencode($client['email']);

        return $mailer->send(
            $client['email'],
            'Vérifiez votre compte Nivah',
            'account-verification',
            [
                'prenom' => $client['prenom'],
                'nom' => $client['nom'],
                'code_verification' => $codeVerification,
                'activation_url' => $activationUrl
            ]
        );
    }

    /**
     * Email de bienvenue après inscription
     */
    public static function sendWelcome($client) {
        $mailer = new self();

        return $mailer->send(
            $client['email'],
            'Bienvenue sur Nivah! 🎉',
            'welcome',
            [
                'prenom' => $client['prenom'],
                'nom' => $client['nom'],
                'email' => $client['email']
            ]
        );
    }

    /**
     * Email de réinitialisation de mot de passe
     */
    public static function sendPasswordReset($client, $resetToken) {
        $mailer = new self();

        $resetUrl = Config::get('APP_URL', 'https://nivah.com') . '/reset-password?token=' . $resetToken;

        return $mailer->send(
            $client['email'],
            'Réinitialisation de votre mot de passe',
            'password-reset',
            [
                'prenom' => $client['prenom'],
                'reset_url' => $resetUrl,
                'reset_token' => $resetToken,
                'valid_until' => date('d/m/Y H:i', strtotime('+1 hour'))
            ]
        );
    }

    /**
     * Email de confirmation de commande
     */
    public static function sendOrderConfirmation($commande, $client) {
        $mailer = new self();

        return $mailer->send(
            $client['email'],
            'Confirmation de votre commande #' . $commande['numero'],
            'order-confirmation',
            [
                'prenom' => $client['prenom'],
                'commande' => $commande,
                'client' => $client,
                'tracking_url' => Config::get('APP_URL', 'https://nivah.com') . '/commandes/' . $commande['numero']
            ]
        );
    }

    /**
     * Email de mise à jour du statut de commande
     */
    public static function sendOrderStatusUpdate($commande, $client, $ancienStatut) {
        $mailer = new self();

        $statusMessages = [
            'confirmee' => 'Votre commande a été confirmée',
            'en_preparation' => 'Votre commande est en préparation',
            'expedie' => 'Votre commande a été expédiée',
            'en_livraison' => 'Votre commande est en cours de livraison',
            'livree' => 'Votre commande a été livrée',
            'annulee' => 'Votre commande a été annulée'
        ];

        $subject = $statusMessages[$commande['statut']] ?? 'Mise à jour de votre commande';

        return $mailer->send(
            $client['email'],
            $subject . ' #' . $commande['numero'],
            'order-status-update',
            [
                'prenom' => $client['prenom'],
                'commande' => $commande,
                'ancien_statut' => $ancienStatut,
                'nouveau_statut' => $commande['statut'],
                'message' => $subject
            ]
        );
    }

    /**
     * Email de confirmation de demande SAV
     */
    public static function sendSupportRequestConfirmation($demande, $client) {
        $mailer = new self();

        return $mailer->send(
            $client['email'],
            'Votre demande #' . $demande['numero'] . ' a été reçue',
            'support-confirmation',
            [
                'prenom' => $client['prenom'],
                'demande' => $demande,
                'client' => $client
            ]
        );
    }

    /**
     * Email de réponse à une demande SAV
     */
    public static function sendSupportResponse($demande, $client, $reponse) {
        $mailer = new self();

        return $mailer->send(
            $client['email'],
            'Réponse à votre demande #' . $demande['numero'],
            'support-response',
            [
                'prenom' => $client['prenom'],
                'demande' => $demande,
                'reponse' => $reponse
            ]
        );
    }

    /**
     * Email de notification de promotion
     */
    public static function sendPromoNotification($client, $promotion) {
        $mailer = new self();

        return $mailer->send(
            $client['email'],
            '🎁 ' . $promotion['titre'],
            'promotion',
            [
                'prenom' => $client['prenom'],
                'promotion' => $promotion
            ]
        );
    }
}

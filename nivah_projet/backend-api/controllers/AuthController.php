<?php
/**
 * AuthController - Gestion de l'authentification
 */

require_once __DIR__ . '/../core/Mailer.php';

class AuthController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * POST /auth/register - Inscription d'un nouveau client
     */
    public function register() {
        $data = Response::getBody();

        // Validation - Ajout des champs obligatoires de la BDD
        $errors = Response::validateRequired($data, ['nom', 'prenom', 'email', 'mot_de_passe', 'telephone', 'adresse', 'ville', 'quartier']);
        if ($errors) {
            Response::validationError($errors);
        }

        // Vérifier si l'email existe déjà
        $existing = $this->db->queryOne(
            "SELECT id FROM clients WHERE email = ?",
            [$data['email']]
        );

        if ($existing) {
            Response::error("Cet email est déjà utilisé", 400);
        }

        // Hasher le mot de passe
        $hashedPassword = password_hash($data['mot_de_passe'], PASSWORD_BCRYPT);

        // Générer un code de vérification (6 chiffres)
        $codeVerification = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        try {
            // Insérer le client avec TOUS les champs obligatoires de la BDD
            $sql = "INSERT INTO clients (nom, prenom, email, mot_de_passe, telephone, adresse, ville, quartier, code_verification, newsletter_subscribed, statut, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW())";

            $newsletterSubscribed = isset($data['newsletter_subscribed']) ? (int)$data['newsletter_subscribed'] : 0;

            $this->db->execute($sql, [
                $data['nom'],
                $data['prenom'],
                $data['email'],
                $hashedPassword,
                $data['telephone'],
                $data['adresse'],
                $data['ville'],
                $data['quartier'],
                $codeVerification,
                $newsletterSubscribed
            ]);

            $clientId = $this->db->lastInsertId();

            // Récupérer le client créé
            $client = $this->db->queryOne("SELECT * FROM clients WHERE id = ?", [$clientId]);

            // Envoyer l'email de vérification
            $emailSent = Mailer::sendAccountVerification($client, $codeVerification);

            // Message adapté selon si l'email a été envoyé ou non
            $message = $emailSent
                ? "Inscription réussie. Un code de vérification a été envoyé à votre email."
                : "Inscription réussie. Utilisez le code: $codeVerification (L'email n'a pas pu être envoyé)";

            Response::success([
                'client_id' => $clientId,
                'email' => $data['email'],
                'code_verification' => $codeVerification, // Temporaire pour debug
                'email_sent' => $emailSent
            ], $message, 201);

        } catch (Exception $e) {
            Response::serverError("Erreur lors de l'inscription");
        }
    }

    /**
     * POST /auth/login - Connexion d'un client
     */
    public function login() {
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['email', 'mot_de_passe']);
        if ($errors) {
            Response::validationError($errors);
        }

        // Récupérer le client
        $client = $this->db->queryOne(
            "SELECT * FROM clients WHERE email = ?",
            [$data['email']]
        );

        if (!$client) {
            Response::error("Email ou mot de passe incorrect", 401);
        }

        // Vérifier le mot de passe
        if (!password_verify($data['mot_de_passe'], $client['mot_de_passe'])) {
            Response::error("Email ou mot de passe incorrect", 401);
        }

        // Vérifier si le compte est actif
        if ($client['statut'] === 'bloque') {
            Response::error("Votre compte a été bloqué", 403);
        }

        if ($client['statut'] === 'en_attente') {
            Response::error("Veuillez vérifier votre email avant de vous connecter", 403);
        }

        // Générer le token JWT
        $token = JWT::encode([
            'client_id' => $client['id'],
            'email' => $client['email'],
            'nom' => $client['nom'],
            'prenom' => $client['prenom']
        ]);

        // Mettre à jour la dernière connexion
        $this->db->execute(
            "UPDATE clients SET derniere_connexion = NOW() WHERE id = ?",
            [$client['id']]
        );

        Response::success([
            'token' => $token,
            'token_type' => 'Bearer',
            'client' => [
                'id' => $client['id'],
                'nom' => $client['nom'],
                'prenom' => $client['prenom'],
                'email' => $client['email'],
                'telephone' => $client['telephone'],
                'photo' => $client['photo_profil'],
                'email_verifie' => $client['email_verifie'] ?? false,
                'statut' => $client['statut'] ?? 'actif',
                'derniere_connexion' => $client['derniere_connexion'],
                'created_at' => $client['created_at'] ?? date('Y-m-d H:i:s'),
                'updated_at' => $client['updated_at'] ?? date('Y-m-d H:i:s')
            ]
        ], "Connexion réussie");
    }

    /**
     * POST /auth/forgot-password - Réinitialisation mot de passe
     */
    public function forgotPassword() {
        try {
            $data = Response::getBody();

            $errors = Response::validateRequired($data, ['email']);
            if ($errors) {
                Response::validationError($errors);
            }

            // Vérifier si le client existe
            $client = $this->db->queryOne(
                "SELECT id, email FROM clients WHERE email = ?",
                [$data['email']]
            );

            if (!$client) {
                // On ne révèle pas si l'email existe ou non (sécurité)
                Response::success(null, "Si cet email existe, vous recevrez un code de réinitialisation");
            }

            // Générer un code de réinitialisation
            $resetCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

            // Sauvegarder le code (expiration: 1 heure)
            $this->db->execute(
                "UPDATE clients SET
                    code_reinitialisation = ?,
                    code_reinitialisation_expire = DATE_ADD(NOW(), INTERVAL 1 HOUR)
                 WHERE id = ?",
                [$resetCode, $client['id']]
            );

            // Récupérer le client complet
            $clientComplet = $this->db->queryOne("SELECT * FROM clients WHERE id = ?", [$client['id']]);

            // Envoyer l'email de réinitialisation
            $emailSent = false;
            try {
                $emailSent = Mailer::sendPasswordReset($clientComplet, $resetCode);
            } catch (Exception $mailException) {
                error_log("Erreur envoi email reset: " . $mailException->getMessage());
            }

            Response::success([
                'code_reinitialisation' => $resetCode, // Temporaire pour debug
                'email_sent' => $emailSent
            ], "Un code de réinitialisation a été envoyé à votre email");

        } catch (Exception $e) {
            error_log("Erreur forgotPassword: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            Response::serverError("Erreur lors de l'envoi du code: " . $e->getMessage());
        }
    }

    /**
     * POST /auth/reset-password - Réinitialiser le mot de passe avec le code
     */
    public function resetPassword() {
        $data = Response::getBody();

        $errors = Response::validateRequired($data, ['email', 'code', 'mot_de_passe']);
        if ($errors) {
            Response::validationError($errors);
        }

        // Vérifier si le client existe
        $client = $this->db->queryOne(
            "SELECT * FROM clients WHERE email = ?",
            [$data['email']]
        );

        if (!$client) {
            Response::error("Email invalide", 400);
            return;
        }

        // Vérifier le code de réinitialisation
        if ($client['code_reinitialisation'] !== $data['code']) {
            Response::error("Code de réinitialisation invalide", 400);
            return;
        }

        // Vérifier si le code n'a pas expiré
        if (!$client['code_reinitialisation_expire'] || strtotime($client['code_reinitialisation_expire']) < time()) {
            Response::error("Code de réinitialisation expiré", 400);
            return;
        }

        // Hasher le nouveau mot de passe
        $hashedPassword = password_hash($data['mot_de_passe'], PASSWORD_BCRYPT);

        try {
            // Mettre à jour le mot de passe et supprimer le code
            $this->db->execute(
                "UPDATE clients SET
                    mot_de_passe = ?,
                    code_reinitialisation = NULL,
                    code_reinitialisation_expire = NULL,
                    updated_at = NOW()
                 WHERE id = ?",
                [$hashedPassword, $client['id']]
            );

            Response::success(null, "Mot de passe réinitialisé avec succès");

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la réinitialisation du mot de passe");
        }
    }

    /**
     * GET /auth/me - Obtenir le profil de l'utilisateur connecté
     */
    public function me($user) {
        // Récupérer les infos complètes du client
        $client = $this->db->queryOne(
            "SELECT id, nom, prenom, email, telephone, photo_profil as photo, adresse, ville,
                    email_verifie, statut, derniere_connexion, created_at, updated_at
             FROM clients WHERE id = ?",
            [$user['client_id']]
        );

        if (!$client) {
            Response::notFound("Client introuvable");
        }

        Response::success($client);
    }

    /**
     * POST /auth/verify-email - Vérifier l'email avec le code
     */
    public function verifyEmail() {
        $data = Response::getBody();

        $errors = Response::validateRequired($data, ['email', 'code']);
        if ($errors) {
            Response::validationError($errors);
        }

        // Trouver le client
        $client = $this->db->queryOne(
            "SELECT * FROM clients WHERE email = ?",
            [$data['email']]
        );

        if (!$client) {
            Response::error("Email invalide", 400);
        }

        // Vérifier si déjà vérifié
        if ($client['email_verifie']) {
            Response::error("Email déjà vérifié", 400);
        }

        // Vérifier le code
        if ($client['code_verification'] !== $data['code']) {
            Response::error("Code de vérification invalide", 400);
        }

        try {
            // Activer le compte
            $this->db->execute(
                "UPDATE clients SET
                    email_verifie = TRUE,
                    statut = 'actif',
                    code_verification = NULL,
                    updated_at = NOW()
                 WHERE id = ?",
                [$client['id']]
            );

            // Envoyer l'email de bienvenue
            $clientActif = $this->db->queryOne("SELECT * FROM clients WHERE id = ?", [$client['id']]);
            Mailer::sendWelcome($clientActif);

            // Générer un token JWT pour connexion automatique
            $token = JWT::encode([
                'client_id' => $client['id'],
                'email' => $client['email']
            ]);

            Response::success([
                'token' => $token,
                'token_type' => 'Bearer',
                'client' => [
                    'id' => $clientActif['id'],
                    'nom' => $clientActif['nom'],
                    'prenom' => $clientActif['prenom'],
                    'email' => $clientActif['email'],
                    'telephone' => $clientActif['telephone'],
                    'photo' => $clientActif['photo_profil'],
                    'email_verifie' => $clientActif['email_verifie'] ?? true,
                    'statut' => $clientActif['statut'] ?? 'actif',
                    'derniere_connexion' => $clientActif['derniere_connexion'],
                    'created_at' => $clientActif['created_at'] ?? date('Y-m-d H:i:s'),
                    'updated_at' => $clientActif['updated_at'] ?? date('Y-m-d H:i:s')
                ]
            ], "Email vérifié avec succès! Bienvenue sur Nivah!");

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la vérification");
        }
    }

    /**
     * POST /auth/resend-verification - Renvoyer le code de vérification
     */
    public function resendVerification() {
        $data = Response::getBody();

        $errors = Response::validateRequired($data, ['email']);
        if ($errors) {
            Response::validationError($errors);
        }

        $client = $this->db->queryOne(
            "SELECT * FROM clients WHERE email = ?",
            [$data['email']]
        );

        if (!$client) {
            // Ne pas révéler si l'email existe
            Response::success(null, "Si cet email existe, un nouveau code a été envoyé");
            return; // Important: arrêter l'exécution ici
        }

        if ($client['email_verifie']) {
            Response::error("Email déjà vérifié", 400);
            return; // Important: arrêter l'exécution ici
        }

        // Générer un nouveau code
        $newCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        try {
            $this->db->execute(
                "UPDATE clients SET code_verification = ?, updated_at = NOW() WHERE id = ?",
                [$newCode, $client['id']]
            );

            // Renvoyer l'email
            $clientUpdated = $this->db->queryOne("SELECT * FROM clients WHERE id = ?", [$client['id']]);
            Mailer::sendAccountVerification($clientUpdated, $newCode);

            Response::success(null, "Un nouveau code de vérification a été envoyé");

        } catch (Exception $e) {
            Response::serverError("Erreur lors du renvoi du code");
        }
    }

    /**
     * POST /auth/logout - Déconnexion
     */
    public function logout($user) {
        // Avec JWT, pas besoin de faire grand chose côté serveur
        // Le client supprimera le token de son côté
        // On pourrait ajouter le token à une blacklist si besoin

        Response::success(null, "Déconnexion réussie");
    }
}

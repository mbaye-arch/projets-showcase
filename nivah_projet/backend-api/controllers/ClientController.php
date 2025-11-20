<?php
/**
 * ClientController - Gestion du profil client
 */

require_once __DIR__ . '/../models/Client.php';

class ClientController {
    private $clientModel;

    public function __construct() {
        $this->clientModel = new Client();
    }

    /**
     * GET /client/profil - Obtenir le profil complet
     */
    public function profil($user) {
        $clientId = $user['client_id'];

        $client = $this->clientModel->find($clientId);

        if (!$client) {
            Response::notFound("Client introuvable");
        }

        // Ne pas retourner le mot de passe
        unset($client['mot_de_passe']);
        unset($client['code_verification']);
        unset($client['code_reinitialisation']);

        Response::success(['client' => $client]);
    }

    /**
     * PUT /client/profil - Mettre à jour le profil
     */
    public function updateProfil($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Champs modifiables
        $allowedFields = [
            'nom', 'prenom', 'telephone', 'adresse', 'ville',
            'village', 'quartier', 'region', 'departement',
            'commune', 'sexe', 'photo_profil'
        ];

        $updateData = [];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            Response::error("Aucune donnée à mettre à jour", 400);
        }

        try {
            $this->clientModel->update($clientId, $updateData);

            $client = $this->clientModel->find($clientId);
            unset($client['mot_de_passe']);

            Response::success([
                'client' => $client,
                'message' => 'Profil mis à jour avec succès'
            ]);

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la mise à jour du profil");
        }
    }

    /**
     * PUT /client/mot-de-passe - Changer le mot de passe
     */
    public function changePassword($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['ancien_mot_de_passe', 'nouveau_mot_de_passe']);
        if ($errors) {
            Response::validationError($errors);
        }

        $client = $this->clientModel->find($clientId);

        // Vérifier l'ancien mot de passe
        if (!password_verify($data['ancien_mot_de_passe'], $client['mot_de_passe'])) {
            Response::error("Ancien mot de passe incorrect", 400);
        }

        // Valider le nouveau mot de passe (minimum 6 caractères)
        if (strlen($data['nouveau_mot_de_passe']) < 6) {
            Response::error("Le mot de passe doit contenir au moins 6 caractères", 400);
        }

        try {
            $hashedPassword = password_hash($data['nouveau_mot_de_passe'], PASSWORD_BCRYPT);

            $this->clientModel->update($clientId, [
                'mot_de_passe' => $hashedPassword
            ]);

            Response::success(null, 'Mot de passe modifié avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors du changement de mot de passe");
        }
    }

    /**
     * GET /client/adresses - Liste des adresses
     */
    public function adresses($user) {
        $clientId = $user['client_id'];

        $adresses = $this->db->query(
            "SELECT * FROM adresses_livraison WHERE client_id = ? ORDER BY est_defaut DESC, created_at DESC",
            [$clientId]
        );

        Response::success(['adresses' => $adresses]);
    }

    /**
     * POST /client/adresses - Ajouter une adresse
     */
    public function ajouterAdresse($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation
        $errors = Response::validateRequired($data, ['adresse', 'ville', 'quartier']);
        if ($errors) {
            Response::validationError($errors);
        }

        try {
            $db = Database::getInstance();

            // Si c'est l'adresse par défaut, retirer le défaut des autres
            if (isset($data['est_defaut']) && $data['est_defaut']) {
                $db->execute(
                    "UPDATE adresses_livraison SET est_defaut = FALSE WHERE client_id = ?",
                    [$clientId]
                );
            }

            $sql = "INSERT INTO adresses_livraison (
                client_id, nom_complet, telephone, adresse,
                ville, quartier, region, departement, commune,
                instructions_livraison, est_defaut, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

            $db->execute($sql, [
                $clientId,
                $data['nom_complet'] ?? null,
                $data['telephone'] ?? null,
                $data['adresse'],
                $data['ville'],
                $data['quartier'],
                $data['region'] ?? null,
                $data['departement'] ?? null,
                $data['commune'] ?? null,
                $data['instructions_livraison'] ?? null,
                $data['est_defaut'] ?? false
            ]);

            $adresseId = $db->lastInsertId();

            Response::success([
                'adresse_id' => $adresseId,
                'message' => 'Adresse ajoutée avec succès'
            ], 'Adresse ajoutée avec succès', 201);

        } catch (Exception $e) {
            Response::serverError("Erreur lors de l'ajout de l'adresse");
        }
    }

    /**
     * PUT /client/adresses/{id} - Modifier une adresse
     */
    public function updateAdresse($user, $adresseId) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        $db = Database::getInstance();

        // Vérifier que l'adresse appartient au client
        $adresse = $db->queryOne(
            "SELECT * FROM adresses_livraison WHERE id = ? AND client_id = ?",
            [$adresseId, $clientId]
        );

        if (!$adresse) {
            Response::notFound("Adresse introuvable");
        }

        try {
            // Si devient adresse par défaut
            if (isset($data['est_defaut']) && $data['est_defaut']) {
                $db->execute(
                    "UPDATE adresses_livraison SET est_defaut = FALSE WHERE client_id = ?",
                    [$clientId]
                );
            }

            $fields = [];
            $values = [];

            $allowedFields = ['nom_complet', 'telephone', 'adresse', 'ville', 'quartier',
                             'region', 'departement', 'commune', 'instructions_livraison', 'est_defaut'];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($fields)) {
                Response::error("Aucune donnée à mettre à jour", 400);
            }

            $values[] = $adresseId;
            $sql = "UPDATE adresses_livraison SET " . implode(', ', $fields) . " WHERE id = ?";

            $db->execute($sql, $values);

            Response::success(null, 'Adresse mise à jour avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la mise à jour de l'adresse");
        }
    }

    /**
     * DELETE /client/adresses/{id} - Supprimer une adresse
     */
    public function supprimerAdresse($user, $adresseId) {
        $clientId = $user['client_id'];

        $db = Database::getInstance();

        // Vérifier que l'adresse appartient au client
        $adresse = $db->queryOne(
            "SELECT * FROM adresses_livraison WHERE id = ? AND client_id = ?",
            [$adresseId, $clientId]
        );

        if (!$adresse) {
            Response::notFound("Adresse introuvable");
        }

        try {
            $db->execute(
                "DELETE FROM adresses_livraison WHERE id = ?",
                [$adresseId]
            );

            Response::success(null, 'Adresse supprimée avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la suppression de l'adresse");
        }
    }

    /**
     * PUT /client/preferences - Mettre à jour les préférences
     */
    public function updatePreferences($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        $allowedFields = ['notifications_enabled', 'newsletter_subscribed', 'langue'];

        $updateData = [];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            Response::error("Aucune donnée à mettre à jour", 400);
        }

        try {
            $this->clientModel->update($clientId, $updateData);

            Response::success(null, 'Préférences mises à jour avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la mise à jour des préférences");
        }
    }

    /**
     * DELETE /client/compte - Supprimer le compte
     */
    public function supprimerCompte($user) {
        $clientId = $user['client_id'];
        $data = Response::getBody();

        // Validation du mot de passe pour confirmation
        $errors = Response::validateRequired($data, ['mot_de_passe']);
        if ($errors) {
            Response::validationError($errors);
        }

        $client = $this->clientModel->find($clientId);

        if (!password_verify($data['mot_de_passe'], $client['mot_de_passe'])) {
            Response::error("Mot de passe incorrect", 400);
        }

        try {
            // Soft delete (changer le statut)
            $this->clientModel->delete($clientId);

            Response::success(null, 'Compte supprimé avec succès');

        } catch (Exception $e) {
            Response::serverError("Erreur lors de la suppression du compte");
        }
    }
}

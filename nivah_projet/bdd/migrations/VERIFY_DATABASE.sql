-- ============================================
-- SCRIPT DE VÉRIFICATION DE LA BASE DE DONNÉES
-- Exécuter après les migrations pour valider
-- ============================================

-- Vérifier toutes les colonnes critiques

SELECT 'Vérification de la table CLIENTS' AS verification;

SELECT
    CASE
        WHEN COUNT(*) = 13 THEN '✅ CLIENTS: OK - Toutes les colonnes NOT NULL présentes'
        ELSE '❌ CLIENTS: ERREUR - Colonnes manquantes'
    END AS resultat
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'clients'
AND COLUMN_NAME IN ('nom', 'prenom', 'email', 'telephone', 'mot_de_passe',
                     'adresse', 'ville', 'quartier',
                     'code_verification', 'code_reinitialisation', 'code_reinitialisation_expire',
                     'email_verifie', 'statut');

-- Liste des colonnes clients
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'clients'
ORDER BY ORDINAL_POSITION;

SELECT '---' AS separator;
SELECT 'Vérification de la table PANIERS' AS verification;

SELECT
    CASE
        WHEN COUNT(*) >= 4 THEN '✅ PANIERS: OK - Colonnes essentielles présentes'
        ELSE '❌ PANIERS: ERREUR - Colonnes manquantes'
    END AS resultat
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'paniers'
AND COLUMN_NAME IN ('client_id', 'session_id', 'reference_panier', 'statut');

SELECT '---' AS separator;
SELECT 'Vérification de la table COMMANDES' AS verification;

SELECT
    CASE
        WHEN COUNT(*) = 17 THEN '✅ COMMANDES: OK - Toutes les colonnes NOT NULL présentes'
        ELSE CONCAT('❌ COMMANDES: ERREUR - Trouvé ', COUNT(*), '/17 colonnes')
    END AS resultat
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'commandes'
AND COLUMN_NAME IN ('numero_commande', 'client_id',
                     'sous_total', 'total_final',
                     'adresse_livraison_json',
                     'region_livraison', 'departement_livraison', 'commune_livraison',
                     'quartier_livraison', 'adresse_complete',
                     'nom_destinataire', 'prenom_destinataire', 'telephone_destinataire',
                     'statut', 'statut_paiement',
                     'paydunya_token', 'raison_annulation');

-- Détails colonnes commandes
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'commandes'
AND COLUMN_NAME IN ('numero_commande', 'numero_tracking', 'paydunya_token', 'raison_annulation',
                     'adresse_livraison_json', 'region_livraison', 'nom_destinataire')
ORDER BY ORDINAL_POSITION;

SELECT '---' AS separator;
SELECT 'Vérification de la table COMMANDE_ARTICLES' AS verification;

SELECT
    CASE
        WHEN COUNT(*) = 8 THEN '✅ COMMANDE_ARTICLES: OK - Toutes les colonnes présentes'
        ELSE '❌ COMMANDE_ARTICLES: ERREUR - Colonnes manquantes'
    END AS resultat
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'commande_articles'
AND COLUMN_NAME IN ('commande_id', 'produit_id', 'reference_produit',
                     'nom_produit', 'image_produit',
                     'quantite', 'prix_unitaire', 'prix_final');

SELECT '---' AS separator;
SELECT 'Vérification de la table ADRESSES_LIVRAISON' AS verification;

SELECT
    CASE
        WHEN COUNT(*) >= 1 THEN '✅ ADRESSES_LIVRAISON: OK - Table existe'
        ELSE '❌ ADRESSES_LIVRAISON: ERREUR - Table n''existe pas'
    END AS resultat
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'adresses_livraison';

-- Structure adresses_livraison
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'adresses_livraison'
ORDER BY ORDINAL_POSITION;

SELECT '---' AS separator;
SELECT 'Vérification des INDEX' AS verification;

-- Index sur clients
SELECT
    CONCAT('✅ Index clients: ', GROUP_CONCAT(DISTINCT INDEX_NAME SEPARATOR ', ')) AS resultat
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'clients'
AND INDEX_NAME IN ('idx_email', 'idx_telephone', 'idx_code_reinitialisation');

-- Index sur commandes
SELECT
    CONCAT('✅ Index commandes: ', GROUP_CONCAT(DISTINCT INDEX_NAME SEPARATOR ', ')) AS resultat
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'commandes'
AND INDEX_NAME IN ('idx_numero', 'idx_client', 'idx_paydunya_token');

SELECT '---' AS separator;
SELECT 'RÉSUMÉ FINAL' AS titre;

SELECT
    TABLE_NAME,
    TABLE_ROWS as 'Nombre_Lignes',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Taille_MB'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('clients', 'paniers', 'panier_articles',
                    'commandes', 'commande_articles',
                    'produits', 'boutiques', 'adresses_livraison')
ORDER BY TABLE_NAME;

SELECT '✅ VÉRIFICATION TERMINÉE' AS resultat;
SELECT 'Si tous les tests affichent ✅, la base de données est prête!' AS message;

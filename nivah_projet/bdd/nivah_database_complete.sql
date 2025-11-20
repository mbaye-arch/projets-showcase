-- ============================================
-- BASE DE DONNÉES COMPLÈTE NIVAH
-- Architecture E-commerce Multi-Boutiques
-- Ordre d'exécution: Respecter cet ordre pour les dépendances
-- ============================================

-- Configuration initiale
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- 1. GESTION DES EMPLOYÉS (Indépendant)
-- ============================================

-- Table principale des employés
CREATE TABLE IF NOT EXISTS employes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance VARCHAR(200) NOT NULL,
  adresse TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employe', 'super_admin') DEFAULT 'employe',
  statut ENUM('actif', 'suspendu', 'inactif') DEFAULT 'actif',
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255) DEFAULT NULL,
  failed_login_attempts INT DEFAULT 0,
  account_locked_until DATETIME DEFAULT NULL,
  last_login DATETIME DEFAULT NULL,
  last_ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_statut (statut),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (created_by) REFERENCES employes(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES employes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. GESTION DES CLIENTS (Indépendant)
-- ============================================

-- Table principale des clients
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  
  -- Adresse
  adresse TEXT NOT NULL,
  ville VARCHAR(100) NOT NULL,
  village VARCHAR(200) DEFAULT NULL,
  quartier VARCHAR(200) NOT NULL,
  
  photo_profil VARCHAR(255) DEFAULT NULL,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  derniere_connexion DATETIME DEFAULT NULL,
  statut ENUM('actif', 'suspendu', 'inactif', 'en_attente') DEFAULT 'en_attente',
  
  -- Vérification email
  email_verifie BOOLEAN DEFAULT FALSE,
  code_verification VARCHAR(6) DEFAULT NULL,
  code_expiration DATETIME DEFAULT NULL,
  
  -- Adresse structurée (optionnel, pour compatibilité future)
  region VARCHAR(100) DEFAULT NULL,
  departement VARCHAR(100) DEFAULT NULL,
  commune VARCHAR(100) DEFAULT NULL,
  
  sexe ENUM('masculin', 'feminin', 'autre') DEFAULT 'autre',
  
  failed_login_attempts INT DEFAULT 0,
  account_locked_until DATETIME DEFAULT NULL,
  last_ip_address VARCHAR(45) DEFAULT NULL,
  
  notifications_enabled BOOLEAN DEFAULT TRUE,
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  langue ENUM('fr', 'en', 'wo') DEFAULT 'fr',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_telephone (telephone),
  INDEX idx_statut (statut),
  INDEX idx_email_verifie (email_verifie),
  INDEX idx_ville (ville),
  INDEX idx_region (region),
  INDEX idx_departement (departement),
  INDEX idx_commune (commune),
  INDEX idx_created_at (created_at),
  
  FULLTEXT idx_adresse_search (region, departement, commune, ville, quartier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. GESTION DES BOUTIQUES (Indépendant)
-- ============================================

-- Table des boutiques (version simplifiée)
CREATE TABLE IF NOT EXISTS boutiques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_boutique VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  logo_url VARCHAR(1000) NOT NULL,
  description TEXT,
  
  nombre_produits INT DEFAULT 0,
  nombre_ventes INT DEFAULT 0,
  note_moyenne DECIMAL(3,2) DEFAULT 0.00,
  
  est_active BOOLEAN DEFAULT TRUE,
  est_featured BOOLEAN DEFAULT FALSE,
  ordre_affichage INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_active (est_active),
  INDEX idx_featured (est_featured),
  
  FULLTEXT idx_search (nom_boutique, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. GESTION DES PRODUITS (Dépend de: boutiques)
-- ============================================

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT DEFAULT NULL,
  nom VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  icone VARCHAR(100),
  image_url VARCHAR(500),
  ordre INT DEFAULT 0,
  est_actif BOOLEAN DEFAULT TRUE,
  type_produit ENUM('physique', 'digital', 'service') DEFAULT 'physique',
  
  meta_title VARCHAR(200),
  meta_description TEXT,
  meta_keywords TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_parent_id (parent_id),
  INDEX idx_slug (slug),
  INDEX idx_ordre (ordre),
  INDEX idx_est_actif (est_actif),
  
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des marques
CREATE TABLE IF NOT EXISTS marques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  site_web VARCHAR(500),
  pays_origine VARCHAR(100),
  est_premium BOOLEAN DEFAULT FALSE,
  est_actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_est_actif (est_actif),
  FULLTEXT idx_search (nom, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des fournisseurs externes
CREATE TABLE IF NOT EXISTS fournisseurs_externes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom ENUM('amazon', 'shein', 'temu', 'alibaba', 'aliexpress', 'zara', 'hm', 'nike', 'adidas', 'autre') NOT NULL,
  nom_affichage VARCHAR(100) NOT NULL,
  logo_url VARCHAR(500),
  url_base VARCHAR(500),
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  commission_pourcentage DECIMAL(5,2) DEFAULT 0.00,
  est_actif BOOLEAN DEFAULT TRUE,
  config_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_nom (nom),
  INDEX idx_est_actif (est_actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table principale des produits
CREATE TABLE IF NOT EXISTS produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  boutique_id INT DEFAULT NULL,
  
  reference_interne VARCHAR(50) UNIQUE NOT NULL,
  reference_externe VARCHAR(200),
  
  nom VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description_courte TEXT,
  description_longue LONGTEXT,
  
  categorie_id INT NOT NULL,
  sous_categorie_id INT DEFAULT NULL,
  marque_id INT DEFAULT NULL,
  fournisseur_id INT DEFAULT NULL,
  
  prix_achat DECIMAL(10,2) DEFAULT 0.00,
  prix_vente DECIMAL(10,2) NOT NULL,
  prix_promo DECIMAL(10,2) DEFAULT NULL,
  devise ENUM('XOF', 'USD', 'EUR') DEFAULT 'XOF',
  
  quantite_stock INT DEFAULT 0,
  stock_alerte INT DEFAULT 5,
  stock_illimite BOOLEAN DEFAULT FALSE,
  
  genre ENUM('homme', 'femme', 'enfant', 'mixte', 'unisexe', 'adulte_18+') DEFAULT 'mixte',
  
  poids DECIMAL(8,2) DEFAULT NULL,
  longueur DECIMAL(8,2) DEFAULT NULL,
  largeur DECIMAL(8,2) DEFAULT NULL,
  hauteur DECIMAL(8,2) DEFAULT NULL,
  
  est_adulte BOOLEAN DEFAULT FALSE,
  age_minimum INT DEFAULT NULL,
  
  statut ENUM('actif', 'inactif', 'rupture', 'archive') DEFAULT 'actif',
  est_visible BOOLEAN DEFAULT TRUE,
  est_nouveaute BOOLEAN DEFAULT FALSE,
  est_coup_coeur BOOLEAN DEFAULT FALSE,
  
  nombre_vues INT DEFAULT 0,
  nombre_ventes INT DEFAULT 0,
  note_moyenne DECIMAL(3,2) DEFAULT 0.00,
  nombre_avis INT DEFAULT 0,
  
  meta_title VARCHAR(200),
  meta_description TEXT,
  meta_keywords TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_boutique (boutique_id),
  INDEX idx_reference (reference_interne),
  INDEX idx_slug (slug),
  INDEX idx_categorie (categorie_id),
  INDEX idx_marque (marque_id),
  INDEX idx_prix (prix_vente),
  INDEX idx_statut (statut),
  INDEX idx_genre (genre),
  INDEX idx_nouveaute (est_nouveaute),
  INDEX idx_note (note_moyenne),
  
  FULLTEXT idx_search (nom, description_courte, reference_interne),
  
  FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE SET NULL,
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (sous_categorie_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (marque_id) REFERENCES marques(id) ON DELETE SET NULL,
  FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs_externes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des images de produits
CREATE TABLE IF NOT EXISTS images_produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produit_id INT NOT NULL,
  url VARCHAR(1000) NOT NULL,
  alt_text VARCHAR(500),
  type ENUM('principale', 'galerie', 'variante', 'zoom', 'thumbnail') DEFAULT 'galerie',
  est_principale BOOLEAN DEFAULT FALSE,
  ordre INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_produit (produit_id),
  INDEX idx_type (type),
  INDEX idx_principale (est_principale),
  INDEX idx_ordre (ordre),
  
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des variantes de produits
CREATE TABLE IF NOT EXISTS variantes_produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produit_id INT NOT NULL,
  
  taille VARCHAR(20),
  couleur VARCHAR(100),
  couleur_hex VARCHAR(7),
  
  pointure VARCHAR(10),
  contenance VARCHAR(50),
  capacite_stockage VARCHAR(50),
  memoire_ram VARCHAR(50),
  
  sku VARCHAR(100) UNIQUE,
  prix_supplement DECIMAL(10,2) DEFAULT 0.00,
  quantite_stock INT DEFAULT 0,
  
  image_url VARCHAR(1000),
  est_disponible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_produit (produit_id),
  INDEX idx_taille (taille),
  INDEX idx_couleur (couleur),
  INDEX idx_disponible (est_disponible),
  
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. GESTION DES PANIERS (Dépend de: clients, produits)
-- ============================================

-- Table des paniers
CREATE TABLE IF NOT EXISTS paniers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  client_id INT DEFAULT NULL,
  session_id VARCHAR(255) NOT NULL,
  
  reference_panier VARCHAR(50) UNIQUE NOT NULL,
  
  statut ENUM('actif', 'abandonne', 'converti', 'expire') DEFAULT 'actif',
  
  sous_total DECIMAL(10,2) DEFAULT 0.00,
  total_remise DECIMAL(10,2) DEFAULT 0.00,
  frais_livraison DECIMAL(10,2) DEFAULT 0.00,
  total_final DECIMAL(10,2) DEFAULT 0.00,
  
  code_promo VARCHAR(50) DEFAULT NULL,
  montant_promo DECIMAL(10,2) DEFAULT 0.00,
  
  devise ENUM('XOF', 'USD', 'EUR') DEFAULT 'XOF',
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type ENUM('mobile', 'tablet', 'desktop', 'other') DEFAULT 'mobile',
  
  date_abandon DATETIME DEFAULT NULL,
  email_rappel_envoye BOOLEAN DEFAULT FALSE,
  
  converti_en_commande_id INT DEFAULT NULL,
  date_conversion DATETIME DEFAULT NULL,
  
  derniere_activite DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_client (client_id),
  INDEX idx_session (session_id),
  INDEX idx_reference (reference_panier),
  INDEX idx_statut (statut),
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des articles du panier
CREATE TABLE IF NOT EXISTS panier_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  panier_id INT NOT NULL,
  produit_id INT NOT NULL,
  variante_id INT DEFAULT NULL,
  
  quantite INT NOT NULL DEFAULT 1,
  
  prix_unitaire DECIMAL(10,2) NOT NULL,
  prix_promo DECIMAL(10,2) DEFAULT NULL,
  prix_final DECIMAL(10,2) NOT NULL,
  
  sous_total DECIMAL(10,2) GENERATED ALWAYS AS (quantite * prix_final) STORED,
  
  personnalisation TEXT DEFAULT NULL,
  
  nom_produit VARCHAR(500) NOT NULL,
  image_url VARCHAR(1000),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_panier (panier_id),
  INDEX idx_produit (produit_id),
  INDEX idx_variante (variante_id),
  
  FOREIGN KEY (panier_id) REFERENCES paniers(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  FOREIGN KEY (variante_id) REFERENCES variantes_produits(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. GESTION DES COMMANDES (Dépend de: clients, employes, paniers, produits)
-- ============================================

-- Table des commandes
CREATE TABLE IF NOT EXISTS commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  numero_commande VARCHAR(50) UNIQUE NOT NULL,
  reference_externe VARCHAR(100),
  
  client_id INT NOT NULL,
  panier_id INT DEFAULT NULL,
  
  sous_total DECIMAL(10,2) NOT NULL,
  total_remise DECIMAL(10,2) DEFAULT 0.00,
  frais_livraison DECIMAL(10,2) DEFAULT 0.00,
  frais_service DECIMAL(10,2) DEFAULT 0.00,
  taxes DECIMAL(10,2) DEFAULT 0.00,
  total_final DECIMAL(10,2) NOT NULL,
  devise ENUM('XOF', 'USD', 'EUR') DEFAULT 'XOF',
  
  code_promo_utilise VARCHAR(50),
  montant_promo DECIMAL(10,2) DEFAULT 0.00,
  
  statut ENUM('en_attente', 'confirmee', 'en_preparation', 'expedie', 'en_livraison', 'livree', 'annulee', 'remboursee', 'echouee') DEFAULT 'en_attente',
  
  statut_paiement ENUM('en_attente', 'paye', 'partiellement_paye', 'rembourse', 'echoue', 'en_attente_confirmation') DEFAULT 'en_attente',
  
  adresse_livraison_json TEXT NOT NULL,
  region_livraison VARCHAR(100) NOT NULL,
  departement_livraison VARCHAR(100) NOT NULL,
  commune_livraison VARCHAR(100) NOT NULL,
  quartier_livraison VARCHAR(200) NOT NULL,
  adresse_complete TEXT NOT NULL,
  
  nom_destinataire VARCHAR(200) NOT NULL,
  prenom_destinataire VARCHAR(200) NOT NULL,
  telephone_destinataire VARCHAR(20) NOT NULL,
  email_destinataire VARCHAR(255),
  
  instructions_livraison TEXT,
  
  mode_livraison ENUM('standard', 'express', 'retrait_magasin', 'coursier') DEFAULT 'standard',
  numero_tracking VARCHAR(200),
  
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_confirmation DATETIME DEFAULT NULL,
  date_expedition DATETIME DEFAULT NULL,
  date_livraison_reelle DATETIME DEFAULT NULL,
  
  mode_paiement ENUM('carte_bancaire', 'mobile_money', 'virement', 'especes', 'paypal', 'stripe', 'wave', 'orange_money', 'free_money') DEFAULT 'mobile_money',
  reference_paiement VARCHAR(200),
  
  note_client TEXT,
  note_interne TEXT,
  
  numero_facture VARCHAR(50),
  
  ip_address VARCHAR(45),
  device_type ENUM('mobile', 'tablet', 'desktop', 'other') DEFAULT 'mobile',
  
  source ENUM('site_web', 'app_mobile', 'app_ios', 'marketplace', 'telephone', 'autre') DEFAULT 'app_mobile',
  
  assigne_a INT DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_numero (numero_commande),
  INDEX idx_client (client_id),
  INDEX idx_statut (statut),
  INDEX idx_statut_paiement (statut_paiement),
  INDEX idx_date_commande (date_commande),
  INDEX idx_assigne (assigne_a),
  
  FULLTEXT idx_search (numero_commande, nom_destinataire, prenom_destinataire, telephone_destinataire),
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (panier_id) REFERENCES paniers(id) ON DELETE SET NULL,
  FOREIGN KEY (assigne_a) REFERENCES employes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS commande_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  produit_id INT NOT NULL,
  variante_id INT DEFAULT NULL,
  
  reference_produit VARCHAR(100) NOT NULL,
  nom_produit VARCHAR(500) NOT NULL,
  image_produit VARCHAR(1000),
  variante_details VARCHAR(500),
  
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  prix_promo DECIMAL(10,2) DEFAULT NULL,
  prix_final DECIMAL(10,2) NOT NULL,
  sous_total DECIMAL(10,2) NOT NULL,
  
  personnalisation TEXT,
  
  statut ENUM('en_attente', 'confirme', 'en_preparation', 'expedie', 'livre', 'annule', 'retourne') DEFAULT 'en_attente',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_commande (commande_id),
  INDEX idx_produit (produit_id),
  INDEX idx_statut (statut),
  
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT,
  FOREIGN KEY (variante_id) REFERENCES variantes_produits(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  
  montant DECIMAL(10,2) NOT NULL,
  devise ENUM('XOF', 'USD', 'EUR') DEFAULT 'XOF',
  
  mode_paiement ENUM('carte_bancaire', 'mobile_money', 'virement', 'especes', 'paypal', 'stripe', 'wave', 'orange_money', 'free_money') NOT NULL,
  
  reference_transaction VARCHAR(200) UNIQUE NOT NULL,
  reference_externe VARCHAR(200),
  
  statut ENUM('en_attente', 'reussi', 'echoue', 'annule', 'rembourse', 'partiellement_rembourse', 'en_verification') DEFAULT 'en_attente',
  
  provider VARCHAR(100),
  provider_response TEXT,
  
  numero_telephone VARCHAR(20),
  email_paiement VARCHAR(255),
  
  date_initiation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_confirmation DATETIME DEFAULT NULL,
  
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_commande (commande_id),
  INDEX idx_reference (reference_transaction),
  INDEX idx_statut (statut),
  INDEX idx_mode (mode_paiement),
  
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLES COMPLÉMENTAIRES BOUTIQUES
-- ============================================

-- Table des avis sur les boutiques
CREATE TABLE IF NOT EXISTS boutique_avis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  boutique_id INT NOT NULL,
  client_id INT NOT NULL,
  commande_id INT DEFAULT NULL,
  
  note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  
  date_avis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_boutique (boutique_id),
  INDEX idx_client (client_id),
  
  FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS ET AUTOMATISATIONS
-- ============================================

DELIMITER $$

-- Générer référence panier
CREATE TRIGGER before_panier_insert
BEFORE INSERT ON paniers
FOR EACH ROW
BEGIN
  IF NEW.reference_panier IS NULL OR NEW.reference_panier = '' THEN
    SET NEW.reference_panier = CONCAT('CART-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
  END IF;
END$$

-- Générer numéro commande
CREATE TRIGGER before_commande_insert
BEFORE INSERT ON commandes
FOR EACH ROW
BEGIN
  IF NEW.numero_commande IS NULL OR NEW.numero_commande = '' THEN
    SET NEW.numero_commande = CONCAT('NIV-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
  END IF;
END$$

-- Mettre à jour les totaux du panier après ajout d'article
CREATE TRIGGER after_panier_article_insert
AFTER INSERT ON panier_articles
FOR EACH ROW
BEGIN
  UPDATE paniers
  SET 
    sous_total = (SELECT SUM(sous_total) FROM panier_articles WHERE panier_id = NEW.panier_id),
    total_final = (SELECT SUM(sous_total) FROM panier_articles WHERE panier_id = NEW.panier_id),
    derniere_activite = NOW()
  WHERE id = NEW.panier_id;
END$$

-- Mettre à jour nombre de produits par boutique
CREATE TRIGGER after_produit_insert_boutique
AFTER INSERT ON produits
FOR EACH ROW
BEGIN
  IF NEW.boutique_id IS NOT NULL THEN
    UPDATE boutiques
    SET nombre_produits = (SELECT COUNT(*) FROM produits WHERE boutique_id = NEW.boutique_id)
    WHERE id = NEW.boutique_id;
  END IF;
END$$

-- Mettre à jour note moyenne boutique
CREATE TRIGGER after_boutique_avis_insert
AFTER INSERT ON boutique_avis
FOR EACH ROW
BEGIN
  UPDATE boutiques
  SET note_moyenne = (SELECT AVG(note) FROM boutique_avis WHERE boutique_id = NEW.boutique_id)
  WHERE id = NEW.boutique_id;
END$$

-- Générer slug boutique
CREATE TRIGGER before_boutique_insert
BEFORE INSERT ON boutiques
FOR EACH ROW
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nom_boutique, ' ', '-'), 'é', 'e'), 'è', 'e'));
  END IF;
END$$

DELIMITER ;

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue des boutiques actives
CREATE OR REPLACE VIEW vue_boutiques_actives AS
SELECT 
  b.id, b.nom_boutique, b.slug, b.logo_url, b.description,
  b.nombre_produits, b.nombre_ventes, b.note_moyenne,
  b.est_featured, b.ordre_affichage,
  b.created_at
FROM boutiques b
WHERE b.est_active = TRUE
ORDER BY b.est_featured DESC, b.ordre_affichage ASC;

-- Vue des produits par boutique
CREATE OR REPLACE VIEW vue_produits_par_boutique AS
SELECT 
  b.id as boutique_id, b.nom_boutique, b.slug as boutique_slug, b.logo_url as boutique_logo,
  p.id as produit_id, p.nom as produit_nom, p.slug as produit_slug,
  p.prix_vente, p.prix_promo, p.quantite_stock,
  p.genre, p.note_moyenne as produit_note,
  (SELECT url FROM images_produits WHERE produit_id = p.id AND est_principale = TRUE LIMIT 1) as image_principale,
  p.statut as produit_statut
FROM boutiques b
JOIN produits p ON b.id = p.boutique_id
WHERE b.est_active = TRUE AND p.statut = 'actif'
ORDER BY b.nom_boutique, p.nom;

-- Vue des commandes en cours
CREATE OR REPLACE VIEW vue_commandes_en_cours AS
SELECT 
  c.id, c.numero_commande,
  CONCAT(cl.prenom, ' ', cl.nom) as client_nom,
  cl.email, cl.telephone,
  c.total_final, c.statut, c.statut_paiement,
  c.mode_livraison, c.region_livraison,
  c.date_commande,
  (SELECT COUNT(*) FROM commande_articles WHERE commande_id = c.id) as nombre_articles
FROM commandes c
JOIN clients cl ON c.client_id = cl.id
WHERE c.statut NOT IN ('livree', 'annulee', 'remboursee')
ORDER BY c.date_commande DESC;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================
-- TABLES SUPPLÉMENTAIRES POUR NOTIFICATIONS ET FAVORIS
-- ============================================ *
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  type ENUM('commande', 'promo', 'livraison', 'avis', 'systeme'),
  titre VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data_json TEXT,
  lue BOOLEAN DEFAULT FALSE,
  date_lecture DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- NOTE: Table tokens_fcm supprimée - Nous utilisons des emails pour les notifications

CREATE TABLE favoris (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  produit_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_favori (client_id, produit_id),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- Table des demandes clients (support, réclamations, questions)
CREATE TABLE demandes_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  commande_id INT DEFAULT NULL,
  
  numero_demande VARCHAR(50) UNIQUE NOT NULL,
  
  type ENUM('support', 'reclamation', 'question_produit', 'question_livraison', 'remboursement', 'autre') NOT NULL,
  sujet VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  statut ENUM('en_attente', 'en_cours', 'resolu', 'clos', 'annule') DEFAULT 'en_attente',
  priorite ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
  
  reponse TEXT DEFAULT NULL,
  repondu_par INT DEFAULT NULL,
  date_reponse DATETIME DEFAULT NULL,
  
  pieces_jointes JSON DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_client (client_id),
  INDEX idx_commande (commande_id),
  INDEX idx_numero (numero_demande),
  INDEX idx_type (type),
  INDEX idx_statut (statut),
  INDEX idx_priorite (priorite),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE SET NULL,
  FOREIGN KEY (repondu_par) REFERENCES employes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger pour générer numéro de demande automatiquement
DELIMITER $$

CREATE TRIGGER before_demande_client_insert
BEFORE INSERT ON demandes_clients
FOR EACH ROW
BEGIN
  IF NEW.numero_demande IS NULL OR NEW.numero_demande = '' THEN
    SET NEW.numero_demande = CONCAT('DEM-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
  END IF;
END$$

DELIMITER ;

/*
============================================
STRUCTURE DE LA BASE DE DONNÉES NIVAH
============================================

ORDRE D'EXÉCUTION RESPECTÉ:
1. Employés (indépendant)
2. Clients (indépendant)
3. Boutiques (indépendant)
4. Produits (dépend de boutiques, catégories, marques, fournisseurs)
5. Paniers (dépend de clients, produits)
6. Commandes (dépend de clients, employés, paniers, produits)
7. Avis boutiques (dépend de boutiques, clients, commandes)

MODULES IMPLÉMENTÉS:
✅ Employés: Gestion sécurisée avec 2FA
✅ Clients: Authentification, sessions persistantes
✅ Boutiques: Multi-boutiques dynamiques (Zara, H&M, Nike, etc.)
✅ Produits: Multi-catégories (homme/femme/enfant/parfums/etc.)
✅ Paniers: Persistants, abandonnés, multi-appareils
✅ Commandes: Processus complet (paiement, livraison, tracking)
✅ Paiements: Multi-modes (Wave, Orange Money, CB, etc.)

DONNÉES DE TEST INSÉRÉES:
- 1 employé admin (demo.admin@example.invalid / CHANGE_ME_DEMO_PASSWORD)
- 1 client test (demo.user@example.invalid / CHANGE_ME_CLIENT_PASSWORD)
- 5 boutiques (Zara, H&M, Nike, Sephora, Adidas)

POUR UTILISER:
1. Exécuter ce fichier dans phpMyAdmin (InfinityFree)
2. Vérifier les tables créées
3. Tester avec les comptes par défaut
4. Ajouter des produits et les associer aux boutiques

*/



-- Table des logs d'activité
-- À exécuter dans la base de données NIVAH

CREATE TABLE IF NOT EXISTS logs_activite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT NOT NULL,
  action ENUM('create', 'update', 'delete', 'login', 'logout') NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id INT DEFAULT NULL,
  data_before JSON DEFAULT NULL,
  data_after JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_employe (employe_id),
  INDEX idx_action (action),
  INDEX idx_table (table_name),
  INDEX idx_created_at (created_at),

  FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vue pour faciliter la lecture des logs
CREATE OR REPLACE VIEW vue_logs_activite AS
SELECT
    l.id,
    l.action,
    l.table_name,
    l.record_id,
    CONCAT(e.prenom, ' ', e.nom) as employe_nom,
    e.email as employe_email,
    e.role as employe_role,
    l.ip_address,
    l.created_at
FROM logs_activite l
JOIN employes e ON l.employe_id = e.id
ORDER BY l.created_at DESC;

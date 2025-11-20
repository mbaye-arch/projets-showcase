USE sentechcare_internal_manager;

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS types_clients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_types_clients_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catalogues (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(160) NOT NULL,
  titre VARCHAR(200) NOT NULL,
  sous_titre VARCHAR(255) NULL,
  description TEXT NULL,
  type_client_id INT UNSIGNED NULL,
  logo VARCHAR(255) NULL,
  image_couverture VARCHAR(255) NULL,
  theme VARCHAR(80) DEFAULT 'standard',
  afficher_prix TINYINT(1) NOT NULL DEFAULT 1,
  afficher_references TINYINT(1) NOT NULL DEFAULT 1,
  afficher_caracteristiques TINYINT(1) NOT NULL DEFAULT 1,
  message_final TEXT NULL,
  pied_de_page TEXT NULL,
  statut ENUM('brouillon', 'publie', 'archive') DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_catalogues_type_client
    FOREIGN KEY (type_client_id) REFERENCES types_clients(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_catalogues_nom (nom),
  INDEX idx_catalogues_type_client (type_client_id),
  INDEX idx_catalogues_statut (statut)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catalogue_sections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  catalogue_id INT UNSIGNED NOT NULL,
  nom VARCHAR(160) NOT NULL,
  description TEXT NULL,
  ordre INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_catalogue_sections_catalogue
    FOREIGN KEY (catalogue_id) REFERENCES catalogues(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_catalogue_sections_catalogue (catalogue_id),
  INDEX idx_catalogue_sections_ordre (ordre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catalogue_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  catalogue_id INT UNSIGNED NOT NULL,
  section_id INT UNSIGNED NULL,
  produit_id INT UNSIGNED NOT NULL,
  type_produit ENUM('hardware', 'software') NOT NULL,
  ordre INT NOT NULL DEFAULT 1,
  prix_personnalise DECIMAL(12,2) NULL,
  titre_personnalise VARCHAR(255) NULL,
  description_personnalisee TEXT NULL,
  note_commerciale TEXT NULL,
  remise DECIMAL(5,2) NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  mise_en_avant TINYINT(1) NOT NULL DEFAULT 0,
  image_specifique VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_catalogue_items_catalogue
    FOREIGN KEY (catalogue_id) REFERENCES catalogues(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_catalogue_items_section
    FOREIGN KEY (section_id) REFERENCES catalogue_sections(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_catalogue_items_catalogue (catalogue_id),
  INDEX idx_catalogue_items_section (section_id),
  INDEX idx_catalogue_items_type_produit (type_produit),
  INDEX idx_catalogue_items_produit_id (produit_id),
  INDEX idx_catalogue_items_ordre (ordre)
) ENGINE=InnoDB;

INSERT INTO types_clients (nom, description)
VALUES
  ('particulier', 'Catalogue orienté usage personnel'),
  ('entreprise', 'Catalogue orienté PME/PMI'),
  ('école', 'Catalogue pour établissements scolaires'),
  ('administration', 'Catalogue pour institutions publiques'),
  ('gaming', 'Catalogue spécialisé gaming'),
  ('bureautique', 'Catalogue bureautique standard'),
  ('professionnel', 'Catalogue professionnel premium'),
  ('sur mesure', 'Catalogue personnalisé par besoin client')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

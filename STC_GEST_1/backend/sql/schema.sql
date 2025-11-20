CREATE DATABASE IF NOT EXISTS sentechcare_internal_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sentechcare_internal_manager;

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS suppliers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(150) NULL,
  supplier_type VARCHAR(100) NULL,
  platform VARCHAR(100) NULL,
  delivery_delay VARCHAR(100) NULL,
  reliability_level VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_suppliers_name (name),
  INDEX idx_suppliers_name (name),
  INDEX idx_suppliers_platform (platform),
  INDEX idx_suppliers_country (country)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category_type VARCHAR(120) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_name (name),
  INDEX idx_categories_type (category_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hardware (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  reference VARCHAR(120) NULL,
  brand VARCHAR(120) NULL,
  model VARCHAR(120) NULL,
  description TEXT NULL,
  hardware_type ENUM('informatique', 'réseau', 'sécurité', 'multimédia', 'gaming', 'bureautique', 'autre') DEFAULT 'autre',
  category_id INT UNSIGNED NULL,
  supplier_id INT UNSIGNED NULL,
  purchase_price DECIMAL(12,2) NULL,
  sale_price DECIMAL(12,2) NULL,
  quantity INT DEFAULT 0,
  condition_state ENUM('neuf', 'reconditionné', 'occasion') DEFAULT 'neuf',
  source_country VARCHAR(100) NULL,
  estimated_delay VARCHAR(100) NULL,
  notes TEXT NULL,
  main_image VARCHAR(255) NULL,
  video_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hardware_reference (reference),
  CONSTRAINT fk_hardware_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_hardware_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_hardware_name (name),
  INDEX idx_hardware_reference (reference),
  INDEX idx_hardware_type (hardware_type),
  INDEX idx_hardware_state (condition_state),
  INDEX idx_hardware_category (category_id),
  INDEX idx_hardware_supplier (supplier_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hardware_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hardware_id INT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hardware_images_hardware
    FOREIGN KEY (hardware_id) REFERENCES hardware(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_hardware_images_hardware (hardware_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS software (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  software_type ENUM('logiciel de gestion', 'logiciel éducatif', 'logiciel interne', 'logiciel de sécurité', 'utilitaire', 'autre') DEFAULT 'autre',
  category_id INT UNSIGNED NULL,
  description TEXT NULL,
  usage_purpose VARCHAR(255) NULL,
  has_license TINYINT(1) NOT NULL DEFAULT 0,
  price DECIMAL(12,2) NULL,
  vendor_name VARCHAR(160) NULL,
  compatibility VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_software_name (name),
  CONSTRAINT fk_software_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_software_name (name),
  INDEX idx_software_type (software_type),
  INDEX idx_software_category (category_id)
) ENGINE=InnoDB;

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

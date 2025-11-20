-- Migration: Créer la table adresses_livraison utilisée dans ClientController
-- Cette table est référencée dans le code mais n'existe pas dans le schéma de base

CREATE TABLE IF NOT EXISTS adresses_livraison (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,

  nom_complet VARCHAR(200) DEFAULT NULL,
  telephone VARCHAR(20) DEFAULT NULL,

  adresse TEXT NOT NULL,
  ville VARCHAR(100) NOT NULL,
  quartier VARCHAR(200) NOT NULL,

  region VARCHAR(100) DEFAULT NULL,
  departement VARCHAR(100) DEFAULT NULL,
  commune VARCHAR(100) DEFAULT NULL,

  instructions_livraison TEXT DEFAULT NULL,

  est_defaut BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_client (client_id),
  INDEX idx_defaut (est_defaut),

  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MIGRATIONS À EXÉCUTER APRÈS nivah_database_complete.sql
-- Ordre d'exécution: Respecter cet ordre
-- ============================================

-- Migration 001: Ajouter colonnes pour réinitialisation mot de passe
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS code_reinitialisation VARCHAR(6) DEFAULT NULL AFTER code_verification,
ADD COLUMN IF NOT EXISTS code_reinitialisation_expire DATETIME DEFAULT NULL AFTER code_reinitialisation;

CREATE INDEX IF NOT EXISTS idx_code_reinitialisation ON clients(code_reinitialisation);

-- Migration 002: Ajouter colonnes optionnelles pour commandes
ALTER TABLE commandes
ADD COLUMN IF NOT EXISTS paydunya_token VARCHAR(255) DEFAULT NULL AFTER reference_paiement,
ADD COLUMN IF NOT EXISTS raison_annulation TEXT DEFAULT NULL AFTER note_interne;

CREATE INDEX IF NOT EXISTS idx_paydunya_token ON commandes(paydunya_token);

-- Migration 003: Créer table adresses_livraison
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

-- ============================================
-- FIN DES MIGRATIONS
-- ============================================

-- Migration: Ajouter les colonnes pour la réinitialisation de mot de passe
-- À exécuter après nivah_database_complete.sql

ALTER TABLE clients
ADD COLUMN code_reinitialisation VARCHAR(6) DEFAULT NULL AFTER code_verification,
ADD COLUMN code_reinitialisation_expire DATETIME DEFAULT NULL AFTER code_reinitialisation;

-- Index pour performance
CREATE INDEX idx_code_reinitialisation ON clients(code_reinitialisation);

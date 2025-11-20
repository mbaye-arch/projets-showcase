-- Migration: Ajouter les colonnes optionnelles utilisées dans le code CommandeController
-- Ces colonnes sont utilisées mais n'existent pas dans le schéma de base

ALTER TABLE commandes
ADD COLUMN paydunya_token VARCHAR(255) DEFAULT NULL AFTER reference_paiement,
ADD COLUMN raison_annulation TEXT DEFAULT NULL AFTER note_interne;

-- Index pour performance
CREATE INDEX idx_paydunya_token ON commandes(paydunya_token);

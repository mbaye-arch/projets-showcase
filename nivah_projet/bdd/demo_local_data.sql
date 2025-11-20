USE stc_gets;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO employes (
  nom, prenom, date_naissance, lieu_naissance, adresse, email, password_hash,
  role, statut, email_verified
) VALUES (
  'Admin', 'Nivah', '1995-01-01', 'Dakar', 'Dakar Plateau',
  'admin@nivah.local', '$2y$12$k8WHicBDZ3UP3cckG1vu0u2PrhE04WVV66o/jhJj.AvA8not2xE4O',
  'super_admin', 'actif', TRUE
) ON DUPLICATE KEY UPDATE statut = 'actif', email_verified = TRUE;

INSERT INTO clients (
  nom, prenom, email, telephone, mot_de_passe, adresse, ville, quartier,
  statut, email_verifie, region, departement, commune, sexe
) VALUES (
  'Diop', 'Awa', 'demo@nivah.local', '+221770000100',
  '$2y$12$k8WHicBDZ3UP3cckG1vu0u2PrhE04WVV66o/jhJj.AvA8not2xE4O',
  'Rue 10, Liberté 6', 'Dakar', 'Liberté 6',
  'actif', TRUE, 'Dakar', 'Dakar', 'Dakar', 'feminin'
) ON DUPLICATE KEY UPDATE statut = 'actif', email_verifie = TRUE;

INSERT INTO boutiques (
  nom_boutique, slug, logo_url, description, nombre_produits, nombre_ventes,
  note_moyenne, est_active, est_featured, ordre_affichage
) VALUES
  ('Nivah Mode Dakar', 'nivah-mode-dakar', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'Sélection mode et accessoires pour une clientèle urbaine.', 0, 128, 4.70, TRUE, TRUE, 1),
  ('Nivah Tech Store', 'nivah-tech-store', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'Accessoires mobiles, audio et objets connectés.', 0, 86, 4.55, TRUE, TRUE, 2),
  ('Nivah Beauty', 'nivah-beauty', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'Cosmétiques, parfums et soins personnels.', 0, 64, 4.40, TRUE, FALSE, 3)
ON DUPLICATE KEY UPDATE est_active = TRUE, est_featured = VALUES(est_featured), note_moyenne = VALUES(note_moyenne);

INSERT INTO categories (nom, slug, description, icone, ordre, est_actif, type_produit)
VALUES
  ('Mode femme', 'mode-femme', 'Vêtements et accessoires femme.', 'checkroom', 1, TRUE, 'physique'),
  ('Accessoires tech', 'accessoires-tech', 'Équipements mobiles et accessoires connectés.', 'devices', 2, TRUE, 'physique'),
  ('Beauté', 'beaute', 'Parfums et soins.', 'spa', 3, TRUE, 'physique')
ON DUPLICATE KEY UPDATE est_actif = TRUE, ordre = VALUES(ordre);

INSERT INTO marques (nom, slug, description, logo_url, pays_origine, est_premium, est_actif)
VALUES
  ('Nivah Essentials', 'nivah-essentials', 'Marque vitrine pour produits lifestyle.', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'Sénégal', FALSE, TRUE),
  ('Urban Tech', 'urban-tech', 'Accessoires pratiques pour mobile et bureau.', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'Sénégal', TRUE, TRUE),
  ('Dakar Beauty', 'dakar-beauty', 'Sélection beauté locale et internationale.', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'Sénégal', FALSE, TRUE)
ON DUPLICATE KEY UPDATE est_actif = TRUE;

INSERT INTO fournisseurs_externes (nom, nom_affichage, logo_url, url_base, commission_pourcentage, est_actif)
VALUES
  ('autre', 'Fournisseur local Dakar', 'http://127.0.0.1:8090/demo-assets/nivah-logo.png', 'https://example.invalid', 8.00, TRUE)
ON DUPLICATE KEY UPDATE est_actif = TRUE;

INSERT INTO produits (
  boutique_id, reference_interne, reference_externe, nom, slug, description_courte,
  description_longue, categorie_id, marque_id, fournisseur_id, prix_achat, prix_vente,
  prix_promo, devise, quantite_stock, stock_alerte, genre, statut, est_visible,
  est_nouveaute, est_coup_coeur, nombre_vues, nombre_ventes, note_moyenne, nombre_avis
) VALUES
  (
    (SELECT id FROM boutiques WHERE slug = 'nivah-mode-dakar'),
    'NIV-MODE-001', 'LOCAL-MODE-001', 'Sac cabas wax premium', 'sac-cabas-wax-premium',
    'Sac cabas élégant avec finition wax.', 'Sac cabas grand format pour quotidien, courses et sorties.',
    (SELECT id FROM categories WHERE slug = 'mode-femme'),
    (SELECT id FROM marques WHERE slug = 'nivah-essentials'),
    (SELECT id FROM fournisseurs_externes WHERE nom_affichage = 'Fournisseur local Dakar' LIMIT 1),
    8500, 15000, 12500, 'XOF', 18, 5, 'femme', 'actif', TRUE, TRUE, TRUE, 220, 34, 4.80, 18
  ),
  (
    (SELECT id FROM boutiques WHERE slug = 'nivah-tech-store'),
    'NIV-TECH-001', 'LOCAL-TECH-001', 'Écouteurs Bluetooth Urban', 'ecouteurs-bluetooth-urban',
    'Écouteurs sans fil avec boîtier compact.', 'Écouteurs Bluetooth pour appels, musique et déplacements quotidiens.',
    (SELECT id FROM categories WHERE slug = 'accessoires-tech'),
    (SELECT id FROM marques WHERE slug = 'urban-tech'),
    (SELECT id FROM fournisseurs_externes WHERE nom_affichage = 'Fournisseur local Dakar' LIMIT 1),
    6000, 12000, 9900, 'XOF', 25, 8, 'unisexe', 'actif', TRUE, TRUE, TRUE, 340, 57, 4.60, 23
  ),
  (
    (SELECT id FROM boutiques WHERE slug = 'nivah-beauty'),
    'NIV-BEAU-001', 'LOCAL-BEAU-001', 'Brume parfumée Dakar Beauty', 'brume-parfumee-dakar-beauty',
    'Brume légère pour usage quotidien.', 'Brume parfumée fraîche avec notes florales et finition douce.',
    (SELECT id FROM categories WHERE slug = 'beaute'),
    (SELECT id FROM marques WHERE slug = 'dakar-beauty'),
    (SELECT id FROM fournisseurs_externes WHERE nom_affichage = 'Fournisseur local Dakar' LIMIT 1),
    4500, 9000, NULL, 'XOF', 32, 10, 'femme', 'actif', TRUE, FALSE, TRUE, 180, 41, 4.50, 12
  ),
  (
    (SELECT id FROM boutiques WHERE slug = 'nivah-mode-dakar'),
    'NIV-MODE-002', 'LOCAL-MODE-002', 'Sneakers casual unisexes', 'sneakers-casual-unisexes',
    'Sneakers légères pour ville.', 'Chaussures casual adaptées aux déplacements urbains.',
    (SELECT id FROM categories WHERE slug = 'mode-femme'),
    (SELECT id FROM marques WHERE slug = 'nivah-essentials'),
    (SELECT id FROM fournisseurs_externes WHERE nom_affichage = 'Fournisseur local Dakar' LIMIT 1),
    12000, 22000, 19900, 'XOF', 14, 4, 'unisexe', 'actif', TRUE, TRUE, FALSE, 150, 22, 4.35, 8
  )
ON DUPLICATE KEY UPDATE
  prix_vente = VALUES(prix_vente),
  prix_promo = VALUES(prix_promo),
  quantite_stock = VALUES(quantite_stock),
  statut = 'actif',
  est_visible = TRUE;

DELETE FROM images_produits
WHERE produit_id IN (SELECT id FROM produits WHERE reference_interne LIKE 'NIV-%');

INSERT INTO images_produits (produit_id, url, alt_text, type, est_principale, ordre)
SELECT id, 'http://127.0.0.1:8090/demo-assets/product-sac-wax.png', 'Sac cabas wax premium', 'principale', TRUE, 1
FROM produits WHERE reference_interne = 'NIV-MODE-001';

INSERT INTO images_produits (produit_id, url, alt_text, type, est_principale, ordre)
SELECT id, 'http://127.0.0.1:8090/demo-assets/product-earbuds.png', 'Écouteurs Bluetooth Urban', 'principale', TRUE, 1
FROM produits WHERE reference_interne = 'NIV-TECH-001';

INSERT INTO images_produits (produit_id, url, alt_text, type, est_principale, ordre)
SELECT id, 'http://127.0.0.1:8090/demo-assets/product-brume.png', 'Brume parfumée Dakar Beauty', 'principale', TRUE, 1
FROM produits WHERE reference_interne = 'NIV-BEAU-001';

INSERT INTO images_produits (produit_id, url, alt_text, type, est_principale, ordre)
SELECT id, 'http://127.0.0.1:8090/demo-assets/product-sneakers.png', 'Sneakers casual unisexes', 'principale', TRUE, 1
FROM produits WHERE reference_interne = 'NIV-MODE-002';

UPDATE boutiques b
SET nombre_produits = (
  SELECT COUNT(*) FROM produits p WHERE p.boutique_id = b.id AND p.statut = 'actif'
)
WHERE b.slug IN ('nivah-mode-dakar', 'nivah-tech-store', 'nivah-beauty');

SET FOREIGN_KEY_CHECKS = 1;

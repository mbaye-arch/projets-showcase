USE sentechcare_internal_manager;

SET NAMES utf8mb4;

INSERT INTO suppliers
  (name, country, city, phone, email, supplier_type, platform, delivery_delay, reliability_level, notes)
VALUES
  ('Amazon Business', 'France', 'Paris', '+33 1 44 55 66 77', 'pro@amazon.fr', 'marketplace', 'Amazon', '2-5 jours', 'élevé', 'Fournisseur principal informatique'),
  ('Back Market Pro', 'France', 'Paris', '+33 1 72 88 90 11', 'sales@backmarket.fr', 'reconditionné', 'Back Market', '4-7 jours', 'élevé', 'Bon rapport qualité/prix'),
  ('TechLocal Dakar', 'Sénégal', 'Dakar', '+221 77 111 22 33', 'contact@techlocal.sn', 'fournisseur local', 'fournisseur local', '1-3 jours', 'moyen', 'Très réactif localement')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (name, category_type, description)
VALUES
  ('ordinateurs', 'hardware', 'Laptops et desktops'),
  ('écrans', 'hardware', 'Moniteurs bureautiques et design'),
  ('routeurs', 'hardware', 'Équipements réseau'),
  ('logiciels de gestion', 'software', 'ERP, CRM, outils administratifs'),
  ('logiciels éducatifs', 'software', 'Applications pour écoles')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO hardware
  (
    name,
    reference,
    brand,
    model,
    description,
    hardware_type,
    category_id,
    supplier_id,
    purchase_price,
    sale_price,
    quantity,
    condition_state,
    source_country,
    estimated_delay,
    notes,
    main_image,
    video_path
  )
VALUES
  (
    'Laptop Dell Latitude 5420',
    'DELL-LAT-5420',
    'Dell',
    'Latitude 5420',
    'Ordinateur portable pro, 16Go RAM, 512Go SSD',
    'informatique',
    (SELECT id FROM categories WHERE name = 'ordinateurs' LIMIT 1),
    (SELECT id FROM suppliers WHERE name = 'Amazon Business' LIMIT 1),
    650000,
    780000,
    12,
    'neuf',
    'France',
    '5 jours',
    'Bonne disponibilité',
    NULL,
    NULL
  ),
  (
    'Routeur TP-Link Archer AX55',
    'TPLINK-AX55',
    'TP-Link',
    'Archer AX55',
    'Routeur WiFi 6 pour PME',
    'réseau',
    (SELECT id FROM categories WHERE name = 'routeurs' LIMIT 1),
    (SELECT id FROM suppliers WHERE name = 'TechLocal Dakar' LIMIT 1),
    55000,
    72000,
    20,
    'reconditionné',
    'Sénégal',
    '2 jours',
    'Stock local',
    NULL,
    NULL
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  brand = VALUES(brand),
  model = VALUES(model),
  sale_price = VALUES(sale_price),
  quantity = VALUES(quantity),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO software
  (
    name,
    software_type,
    category_id,
    description,
    usage_purpose,
    has_license,
    price,
    vendor_name,
    compatibility,
    notes
  )
VALUES
  (
    'SenTechCare ERP Lite',
    'logiciel de gestion',
    (SELECT id FROM categories WHERE name = 'logiciels de gestion' LIMIT 1),
    'Gestion commerciale interne, devis et suivi clients',
    'gestion opérationnelle',
    1,
    120000,
    'SenTechCare',
    'Windows, Linux, navigateur web',
    'Version interne v1'
  ),
  (
    'EduClass Manager',
    'logiciel éducatif',
    (SELECT id FROM categories WHERE name = 'logiciels éducatifs' LIMIT 1),
    'Plateforme de gestion de classes et contenus éducatifs',
    'usage scolaire',
    1,
    98000,
    'Edusoft',
    'Web, Android',
    'Très demandé par les écoles partenaires'
  )
ON DUPLICATE KEY UPDATE
  software_type = VALUES(software_type),
  price = VALUES(price),
  vendor_name = VALUES(vendor_name),
  updated_at = CURRENT_TIMESTAMP;

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

INSERT INTO catalogues
  (
    nom,
    titre,
    sous_titre,
    description,
    type_client_id,
    theme,
    afficher_prix,
    afficher_references,
    afficher_caracteristiques,
    message_final,
    pied_de_page,
    statut
  )
SELECT
  'Catalogue PME 2026',
  'Catalogue Solutions IT PME',
  'Équipements et logiciels recommandés',
  'Sélection de produits pour besoins bureautiques et réseau.',
  tc.id,
  'corporate',
  1,
  1,
  1,
  'Merci pour votre confiance. Notre équipe vous accompagne dans le déploiement.',
  'SenTechCare - Offre interne confidentielle',
  'brouillon'
FROM types_clients tc
WHERE tc.nom = 'entreprise'
  AND NOT EXISTS (
    SELECT 1 FROM catalogues c WHERE c.nom = 'Catalogue PME 2026'
  );

SET @catalogue_id = (SELECT id FROM catalogues WHERE nom = 'Catalogue PME 2026' LIMIT 1);

INSERT INTO catalogue_sections (catalogue_id, nom, description, ordre)
SELECT
  @catalogue_id,
  'ordinateurs',
  'Postes de travail et portables',
  1
WHERE @catalogue_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM catalogue_sections cs
    WHERE cs.catalogue_id = @catalogue_id
      AND cs.nom = 'ordinateurs'
  );

INSERT INTO catalogue_sections (catalogue_id, nom, description, ordre)
SELECT
  @catalogue_id,
  'logiciels',
  'Outils métiers et productivité',
  2
WHERE @catalogue_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM catalogue_sections cs
    WHERE cs.catalogue_id = @catalogue_id
      AND cs.nom = 'logiciels'
  );

SET @section_ordinateurs = (
  SELECT id
  FROM catalogue_sections
  WHERE catalogue_id = @catalogue_id
    AND nom = 'ordinateurs'
  LIMIT 1
);

SET @section_logiciels = (
  SELECT id
  FROM catalogue_sections
  WHERE catalogue_id = @catalogue_id
    AND nom = 'logiciels'
  LIMIT 1
);

SET @hardware_id = (
  SELECT id
  FROM hardware
  WHERE reference = 'DELL-LAT-5420'
  LIMIT 1
);

SET @software_id = (
  SELECT id
  FROM software
  WHERE name = 'SenTechCare ERP Lite'
  LIMIT 1
);

INSERT INTO catalogue_items
  (
    catalogue_id,
    section_id,
    produit_id,
    type_produit,
    ordre,
    prix_personnalise,
    titre_personnalise,
    description_personnalisee,
    note_commerciale,
    remise,
    visible,
    mise_en_avant
  )
SELECT
  @catalogue_id,
  @section_ordinateurs,
  @hardware_id,
  'hardware',
  1,
  760000,
  'Laptop Dell Latitude 5420 - Pack PME',
  'Configuration optimisée pour gestion quotidienne.',
  'Inclut préparation et configuration.',
  2.50,
  1,
  1
WHERE @catalogue_id IS NOT NULL
  AND @hardware_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM catalogue_items ci
    WHERE ci.catalogue_id = @catalogue_id
      AND ci.type_produit = 'hardware'
      AND ci.produit_id = @hardware_id
  );

INSERT INTO catalogue_items
  (
    catalogue_id,
    section_id,
    produit_id,
    type_produit,
    ordre,
    prix_personnalise,
    titre_personnalise,
    description_personnalisee,
    note_commerciale,
    remise,
    visible,
    mise_en_avant
  )
SELECT
  @catalogue_id,
  @section_logiciels,
  @software_id,
  'software',
  1,
  115000,
  'SenTechCare ERP Lite - Edition PME',
  'Gestion commerciale simplifiée avec reporting.',
  'Formation de prise en main incluse.',
  4.00,
  1,
  1
WHERE @catalogue_id IS NOT NULL
  AND @software_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM catalogue_items ci
    WHERE ci.catalogue_id = @catalogue_id
      AND ci.type_produit = 'software'
      AND ci.produit_id = @software_id
  );

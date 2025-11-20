USE sentechcare_one;

SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- 0) Roles + Users (idempotent)
-- ---------------------------------------------------------------------------
INSERT INTO roles (name) VALUES
('ADMIN'),
('MANAGER'),
('TECHNICIAN'),
('ACCOUNTANT'),
('SUPPORT')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Demo password hash. Replace it in any environment exposed outside local development.
INSERT INTO users (first_name, last_name, email, password, phone, active, role_id)
SELECT 'Super', 'Admin', 'admin@sentechcare.one',
       '$2y$12$BrPppmzTEjK5jPtPTRZogOJbpihx8MOUfJrfXRVZkgOr8S08iQrCm',
       '+221770000001', 1, r.id
FROM roles r
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'admin@sentechcare.one');

INSERT INTO users (first_name, last_name, email, password, phone, active, role_id)
SELECT 'Demo', 'Tech', 'demo@sentechcare.one',
       '$2y$12$BrPppmzTEjK5jPtPTRZogOJbpihx8MOUfJrfXRVZkgOr8S08iQrCm',
       '+221770000002', 1, r.id
FROM roles r
WHERE r.name = 'TECHNICIAN'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'demo@sentechcare.one');

INSERT INTO users (first_name, last_name, email, password, phone, active, role_id)
SELECT 'Awa', 'Ndiaye', 'manager@sentechcare.one',
       '$2y$12$BrPppmzTEjK5jPtPTRZogOJbpihx8MOUfJrfXRVZkgOr8S08iQrCm',
       '+221770000003', 1, r.id
FROM roles r
WHERE r.name = 'MANAGER'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'manager@sentechcare.one');

INSERT INTO users (first_name, last_name, email, password, phone, active, role_id)
SELECT 'Moussa', 'Fall', 'tech2@sentechcare.one',
       '$2y$12$BrPppmzTEjK5jPtPTRZogOJbpihx8MOUfJrfXRVZkgOr8S08iQrCm',
       '+221770000004', 1, r.id
FROM roles r
WHERE r.name = 'TECHNICIAN'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'tech2@sentechcare.one');

INSERT INTO users (first_name, last_name, email, password, phone, active, role_id)
SELECT 'Fatou', 'Diop', 'accounting@sentechcare.one',
       '$2y$12$BrPppmzTEjK5jPtPTRZogOJbpihx8MOUfJrfXRVZkgOr8S08iQrCm',
       '+221770000005', 1, r.id
FROM roles r
WHERE r.name = 'ACCOUNTANT'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'accounting@sentechcare.one');

-- ---------------------------------------------------------------------------
-- 1) Clients
-- ---------------------------------------------------------------------------
INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'SME', 'Dakar Solutions SARL', NULL, NULL, '+221770001001', 'contact@dakarsolutions.sn',
       'Point E, Rue 12', 'Dakar', 'Senegal', 'Mamadou Seck',
       'Client premium - assistance 24/7', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001001');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'SHOP', 'Pharmacie Central', NULL, NULL, '+221770001002', 'contact@pharmaciecentral.sn',
       'Avenue Bourguiba', 'Dakar', 'Senegal', 'Aissatou Ka',
       'Maintenance caisse + imprimantes', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001002');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'SCHOOL', 'Ecole Horizon Plus', NULL, NULL, '+221770001003', 'it@horizonplus.edu',
       'Liberté 6', 'Dakar', 'Senegal', 'Direction pédagogique',
       'Parc de 40 PC', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001003');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'INSTITUTION', 'Mairie de Rufisque', NULL, NULL, '+221770001004', 'support@mairie-rufisque.sn',
       'Centre administratif', 'Rufisque', 'Senegal', 'Service informatique',
       'Contrat annuel de maintenance', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001004');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'HOUSE', NULL, 'Ibrahima', 'Sow', '+221770001005', 'ibra.sow@example.sn',
       'Parcelles Assainies U22', 'Dakar', 'Senegal', NULL,
       'Interventions ponctuelles', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001005');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'SME', 'Sahel Distribution', NULL, NULL, '+221770001006', 'ops@saheldistribution.sn',
       'Zone industrielle', 'Thiès', 'Senegal', 'Responsable exploitation',
       'Réseau + vidéosurveillance', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001006');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'HOUSE', NULL, 'Aminata', 'Ba', '+221770001007', 'aminata.ba@yahoo.fr',
       'Mermoz', 'Dakar', 'Senegal', NULL,
       'Client inactif temporaire', 0
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001007');

INSERT INTO clients (client_type, company_name, first_name, last_name, phone, email, address, city, country, contact_person, notes, active)
SELECT 'SHOP', 'Electro Keur', NULL, NULL, '+221770001008', 'shop@electrokeur.sn',
       'Sandaga', 'Dakar', 'Senegal', 'Gérant boutique',
       'Abonnement de base', 1
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.phone = '+221770001008');

-- ---------------------------------------------------------------------------
-- 2) Subscriptions
-- ---------------------------------------------------------------------------
INSERT INTO subscriptions (client_id, plan_type, monthly_price, start_date, end_date, billing_frequency, status, description, notes)
SELECT c.id, 'BUSINESS', 149.99, '2026-01-01', '2026-12-31', 'MONTHLY', 'ACTIVE',
       'Support BUSINESS 24/7', 'SLA 4h'
FROM clients c
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.client_id = c.id
      AND s.description = 'Support BUSINESS 24/7'
  );

INSERT INTO subscriptions (client_id, plan_type, monthly_price, start_date, end_date, billing_frequency, status, description, notes)
SELECT c.id, 'PREMIUM', 299.99, '2026-02-01', '2027-01-31', 'MONTHLY', 'ACTIVE',
       'Pack PREMIUM collectivités', 'Support sur site inclus'
FROM clients c
WHERE c.phone = '+221770001004'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.client_id = c.id
      AND s.description = 'Pack PREMIUM collectivités'
  );

INSERT INTO subscriptions (client_id, plan_type, monthly_price, start_date, end_date, billing_frequency, status, description, notes)
SELECT c.id, 'BASIC', 59.00, '2025-10-01', '2026-04-05', 'MONTHLY', 'ACTIVE',
       'Forfait BASIC boutique', 'Expire bientôt'
FROM clients c
WHERE c.phone = '+221770001008'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.client_id = c.id
      AND s.description = 'Forfait BASIC boutique'
  );

INSERT INTO subscriptions (client_id, plan_type, monthly_price, start_date, end_date, billing_frequency, status, description, notes)
SELECT c.id, 'BUSINESS', 120.00, '2025-04-01', '2026-01-31', 'MONTHLY', 'EXPIRED',
       'Ancien contrat BUSINESS', 'À renouveler'
FROM clients c
WHERE c.phone = '+221770001003'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.client_id = c.id
      AND s.description = 'Ancien contrat BUSINESS'
  );

INSERT INTO subscriptions (client_id, plan_type, monthly_price, start_date, end_date, billing_frequency, status, description, notes)
SELECT c.id, 'BUSINESS', 180.00, '2026-01-15', '2026-12-31', 'QUARTERLY', 'SUSPENDED',
       'Contrat réseau + CCTV', 'Suspendu pour impayé'
FROM clients c
WHERE c.phone = '+221770001006'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.client_id = c.id
      AND s.description = 'Contrat réseau + CCTV'
  );

INSERT INTO subscriptions (client_id, plan_type, monthly_price, start_date, end_date, billing_frequency, status, description, notes)
SELECT c.id, 'BASIC', 45.00, '2025-12-01', '2026-11-30', 'ANNUAL', 'ACTIVE',
       'Abonnement domicile', 'Maintenance préventive trimestrielle'
FROM clients c
WHERE c.phone = '+221770001005'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.client_id = c.id
      AND s.description = 'Abonnement domicile'
  );

-- ---------------------------------------------------------------------------
-- 3) Installed Equipments
-- ---------------------------------------------------------------------------
INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'SERVER', 'Dell', 'PowerEdge T150', 'STC-SRV-0001', '2026-01-12', 'ACTIVE', 'SENTECHCARE', '2026-01-12', '2029-01-12', 'Salle serveur', 'Serveur principal'
FROM clients c
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-SRV-0001');

INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'ROUTER', 'MikroTik', 'RB4011', 'STC-RT-0001', '2026-01-12', 'ACTIVE', 'SENTECHCARE', '2026-01-12', '2028-01-12', 'Baie réseau', 'Routeur principal'
FROM clients c
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-RT-0001');

INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'PRINTER', 'HP', 'LaserJet Pro 400', 'STC-PR-0001', '2026-02-02', 'ACTIVE', 'CLIENT', '2026-02-02', '2027-02-02', 'Accueil', 'Imprimante facturation'
FROM clients c
WHERE c.phone = '+221770001002'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-PR-0001');

INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'PC', 'Lenovo', 'ThinkCentre M70', 'STC-PC-0001', '2025-11-10', 'BROKEN', 'CLIENT', '2025-11-10', '2028-11-10', 'Secrétariat', 'Carte mère HS'
FROM clients c
WHERE c.phone = '+221770001003'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-PC-0001');

INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'LAPTOP', 'Dell', 'Latitude 5540', 'STC-LT-0001', '2026-03-01', 'ACTIVE', 'SENTECHCARE', '2026-03-01', '2029-03-01', 'Bureau DG', 'Laptop direction'
FROM clients c
WHERE c.phone = '+221770001004'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-LT-0001');

INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'CAMERA', 'Hikvision', 'DS-2CD1043', 'STC-CAM-0001', '2026-01-20', 'ACTIVE', 'SENTECHCARE', '2026-01-20', '2028-01-20', 'Entrée principale', 'Caméra extérieure'
FROM clients c
WHERE c.phone = '+221770001006'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-CAM-0001');

INSERT INTO installed_equipments (client_id, category, brand, model, serial_number, installation_date, status, source, warranty_start_date, warranty_end_date, location_details, notes)
SELECT c.id, 'SWITCH', 'TP-Link', 'TL-SG1024', 'STC-SW-0001', '2026-01-20', 'REPLACED', 'CLIENT', '2026-01-20', '2028-01-20', 'Rack secondaire', 'Remplacé en mars'
FROM clients c
WHERE c.phone = '+221770001006'
  AND NOT EXISTS (SELECT 1 FROM installed_equipments e WHERE e.serial_number = 'STC-SW-0001');

-- ---------------------------------------------------------------------------
-- 4) Interventions
-- ---------------------------------------------------------------------------
INSERT INTO interventions (
  client_id, assigned_technician_id, type, planned_date, actual_date, status, priority,
  problem_description, diagnosis, solution_provided, duration_minutes, cost, closing_notes
)
SELECT c.id, u.id, 'TROUBLESHOOTING', '2026-03-20 09:00:00', '2026-03-20 10:30:00', 'COMPLETED', 'HIGH',
       'Ralentissements importants sur le réseau local',
       'Saturation switch principal',
       'Reconfiguration QoS + nettoyage boucle',
       90, 75.00, 'Incident résolu'
FROM clients c
JOIN users u ON u.email = 'demo@sentechcare.one'
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.client_id = c.id
      AND i.problem_description = 'Ralentissements importants sur le réseau local'
  );

INSERT INTO interventions (
  client_id, assigned_technician_id, type, planned_date, actual_date, status, priority,
  problem_description, diagnosis, solution_provided, duration_minutes, cost, closing_notes
)
SELECT c.id, u.id, 'MAINTENANCE', '2026-03-20 14:00:00', NULL, 'IN_PROGRESS', 'NORMAL',
       'Maintenance préventive mensuelle',
       NULL, NULL, NULL, 0.00, NULL
FROM clients c
JOIN users u ON u.email = 'tech2@sentechcare.one'
WHERE c.phone = '+221770001004'
  AND NOT EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.client_id = c.id
      AND i.problem_description = 'Maintenance préventive mensuelle'
  );

INSERT INTO interventions (
  client_id, assigned_technician_id, type, planned_date, actual_date, status, priority,
  problem_description, diagnosis, solution_provided, duration_minutes, cost, closing_notes
)
SELECT c.id, u.id, 'INSTALLATION', '2026-03-05 10:00:00', '2026-03-05 12:00:00', 'COMPLETED', 'NORMAL',
       'Installation de nouvelle imprimante pharmacie',
       'Drivers manquants sur poste caisse',
       'Installation pilotes + partage réseau',
       120, 60.00, 'Formation utilisateur effectuée'
FROM clients c
JOIN users u ON u.email = 'demo@sentechcare.one'
WHERE c.phone = '+221770001002'
  AND NOT EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.client_id = c.id
      AND i.problem_description = 'Installation de nouvelle imprimante pharmacie'
  );

INSERT INTO interventions (
  client_id, assigned_technician_id, type, planned_date, actual_date, status, priority,
  problem_description, diagnosis, solution_provided, duration_minutes, cost, closing_notes
)
SELECT c.id, u.id, 'VISIT', '2026-03-25 11:00:00', NULL, 'SCHEDULED', 'LOW',
       'Visite de contrôle trimestrielle', NULL, NULL, NULL, 0.00, NULL
FROM clients c
JOIN users u ON u.email = 'tech2@sentechcare.one'
WHERE c.phone = '+221770001008'
  AND NOT EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.client_id = c.id
      AND i.problem_description = 'Visite de contrôle trimestrielle'
  );

INSERT INTO interventions (
  client_id, assigned_technician_id, type, planned_date, actual_date, status, priority,
  problem_description, diagnosis, solution_provided, duration_minutes, cost, closing_notes
)
SELECT c.id, u.id, 'UPDATE', '2026-03-12 15:00:00', '2026-03-12 15:45:00', 'COMPLETED', 'NORMAL',
       'Mise à jour antivirus parc bureautique',
       'Bases virales obsolètes',
       'Mise à jour centrale et déploiement',
       45, 40.00, 'Parc sécurisé'
FROM clients c
JOIN users u ON u.email = 'demo@sentechcare.one'
WHERE c.phone = '+221770001003'
  AND NOT EXISTS (
    SELECT 1 FROM interventions i
    WHERE i.client_id = c.id
      AND i.problem_description = 'Mise à jour antivirus parc bureautique'
  );

-- ---------------------------------------------------------------------------
-- 5) Tickets
-- ---------------------------------------------------------------------------
INSERT INTO tickets (
  client_id, assigned_technician_id, channel, subject, description, priority, status,
  created_at, resolved_at, resolution_comment, updated_at
)
SELECT c.id, u.id, 'EMAIL', 'Connexion internet instable',
       'La connexion coupe plusieurs fois par heure.',
       'HIGH', 'OPEN',
       '2026-03-19 09:30:00', NULL, NULL, '2026-03-19 09:30:00'
FROM clients c
JOIN users u ON u.email = 'demo@sentechcare.one'
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.client_id = c.id
      AND t.subject = 'Connexion internet instable'
  );

INSERT INTO tickets (
  client_id, assigned_technician_id, channel, subject, description, priority, status,
  created_at, resolved_at, resolution_comment, updated_at
)
SELECT c.id, u.id, 'PHONE', 'Imprimante non détectée',
       'La caisse ne voit plus l''imprimante.',
       'NORMAL', 'IN_PROGRESS',
       '2026-03-18 14:10:00', NULL, NULL, '2026-03-20 08:00:00'
FROM clients c
JOIN users u ON u.email = 'tech2@sentechcare.one'
WHERE c.phone = '+221770001002'
  AND NOT EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.client_id = c.id
      AND t.subject = 'Imprimante non détectée'
  );

INSERT INTO tickets (
  client_id, assigned_technician_id, channel, subject, description, priority, status,
  created_at, resolved_at, resolution_comment, updated_at
)
SELECT c.id, u.id, 'WHATSAPP', 'PC salle prof très lent',
       'Démarrage supérieur à 10 minutes.',
       'HIGH', 'RESOLVED',
       '2026-03-10 10:15:00', '2026-03-10 12:00:00',
       'Disque saturé, nettoyage et optimisation réalisés.',
       '2026-03-10 12:00:00'
FROM clients c
JOIN users u ON u.email = 'demo@sentechcare.one'
WHERE c.phone = '+221770001003'
  AND NOT EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.client_id = c.id
      AND t.subject = 'PC salle prof très lent'
  );

INSERT INTO tickets (
  client_id, assigned_technician_id, channel, subject, description, priority, status,
  created_at, resolved_at, resolution_comment, updated_at
)
SELECT c.id, u.id, 'VISIT', 'Caméra entrée hors service',
       'Image noire sur caméra extérieure.',
       'URGENT', 'CLOSED',
       '2026-03-02 09:00:00', '2026-03-02 11:15:00',
       'Alimentation remplacée.',
       '2026-03-02 11:15:00'
FROM clients c
JOIN users u ON u.email = 'tech2@sentechcare.one'
WHERE c.phone = '+221770001006'
  AND NOT EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.client_id = c.id
      AND t.subject = 'Caméra entrée hors service'
  );

-- ---------------------------------------------------------------------------
-- 6) Quotes + Quote Items
-- ---------------------------------------------------------------------------
INSERT INTO quotes (reference, client_id, quote_date, status, subtotal, discount_amount, total_amount, notes)
SELECT 'DEV-2026-0001', c.id, '2026-03-01', 'SENT', 850.00, 50.00, 800.00, 'Validité 30 jours'
FROM clients c
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.reference = 'DEV-2026-0001');

INSERT INTO quotes (reference, client_id, quote_date, status, subtotal, discount_amount, total_amount, notes)
SELECT 'DEV-2026-0002', c.id, '2026-03-04', 'ACCEPTED', 1200.00, 0.00, 1200.00, 'Accord client reçu'
FROM clients c
WHERE c.phone = '+221770001004'
  AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.reference = 'DEV-2026-0002');

INSERT INTO quotes (reference, client_id, quote_date, status, subtotal, discount_amount, total_amount, notes)
SELECT 'DEV-2026-0003', c.id, '2026-03-08', 'REJECTED', 600.00, 100.00, 500.00, 'Refus pour budget'
FROM clients c
WHERE c.phone = '+221770001002'
  AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.reference = 'DEV-2026-0003');

INSERT INTO quotes (reference, client_id, quote_date, status, subtotal, discount_amount, total_amount, notes)
SELECT 'DEV-2026-0004', c.id, '2026-03-15', 'DRAFT', 300.00, 0.00, 300.00, 'Brouillon en attente validation'
FROM clients c
WHERE c.phone = '+221770001008'
  AND NOT EXISTS (SELECT 1 FROM quotes q WHERE q.reference = 'DEV-2026-0004');

INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total)
SELECT q.id, 'Routeur entreprise', 1.00, 400.00, 400.00
FROM quotes q
WHERE q.reference = 'DEV-2026-0001'
  AND NOT EXISTS (
    SELECT 1 FROM quote_items qi
    WHERE qi.quote_id = q.id
      AND qi.description = 'Routeur entreprise'
  );

INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total)
SELECT q.id, 'Switch manageable 24 ports', 1.00, 450.00, 450.00
FROM quotes q
WHERE q.reference = 'DEV-2026-0001'
  AND NOT EXISTS (
    SELECT 1 FROM quote_items qi
    WHERE qi.quote_id = q.id
      AND qi.description = 'Switch manageable 24 ports'
  );

INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total)
SELECT q.id, 'Caméras IP 4MP', 4.00, 200.00, 800.00
FROM quotes q
WHERE q.reference = 'DEV-2026-0002'
  AND NOT EXISTS (
    SELECT 1 FROM quote_items qi
    WHERE qi.quote_id = q.id
      AND qi.description = 'Caméras IP 4MP'
  );

INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total)
SELECT q.id, 'NVR 8 canaux', 1.00, 400.00, 400.00
FROM quotes q
WHERE q.reference = 'DEV-2026-0002'
  AND NOT EXISTS (
    SELECT 1 FROM quote_items qi
    WHERE qi.quote_id = q.id
      AND qi.description = 'NVR 8 canaux'
  );

INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total)
SELECT q.id, 'Remplacement disque SSD', 2.00, 150.00, 300.00
FROM quotes q
WHERE q.reference = 'DEV-2026-0003'
  AND NOT EXISTS (
    SELECT 1 FROM quote_items qi
    WHERE qi.quote_id = q.id
      AND qi.description = 'Remplacement disque SSD'
  );

INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total)
SELECT q.id, 'Main d''oeuvre intervention', 2.00, 150.00, 300.00
FROM quotes q
WHERE q.reference = 'DEV-2026-0004'
  AND NOT EXISTS (
    SELECT 1 FROM quote_items qi
    WHERE qi.quote_id = q.id
      AND qi.description = 'Main d''oeuvre intervention'
  );

-- ---------------------------------------------------------------------------
-- 7) Invoices + Invoice Items
-- ---------------------------------------------------------------------------
INSERT INTO invoices (reference, client_id, issue_date, due_date, status, total_amount, paid_amount, remaining_amount, payment_method_note, notes)
SELECT 'FAC-2026-0001', c.id, '2026-03-01', '2026-03-15', 'PAID', 920.00, 920.00, 0.00, 'MIXTE', 'Facture totalement réglée'
FROM clients c
WHERE c.phone = '+221770001001'
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.reference = 'FAC-2026-0001');

INSERT INTO invoices (reference, client_id, issue_date, due_date, status, total_amount, paid_amount, remaining_amount, payment_method_note, notes)
SELECT 'FAC-2026-0002', c.id, '2026-03-03', '2026-03-20', 'PARTIALLY_PAID', 1500.00, 600.00, 900.00, 'VIREMENT', 'Acompte reçu'
FROM clients c
WHERE c.phone = '+221770001004'
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.reference = 'FAC-2026-0002');

INSERT INTO invoices (reference, client_id, issue_date, due_date, status, total_amount, paid_amount, remaining_amount, payment_method_note, notes)
SELECT 'FAC-2026-0003', c.id, '2026-03-08', '2026-03-25', 'UNPAID', 450.00, 0.00, 450.00, NULL, 'En attente de règlement'
FROM clients c
WHERE c.phone = '+221770001002'
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.reference = 'FAC-2026-0003');

INSERT INTO invoices (reference, client_id, issue_date, due_date, status, total_amount, paid_amount, remaining_amount, payment_method_note, notes)
SELECT 'FAC-2026-0004', c.id, '2026-03-12', '2026-03-30', 'ISSUED', 2200.00, 0.00, 2200.00, NULL, 'Facture envoyée'
FROM clients c
WHERE c.phone = '+221770001006'
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.reference = 'FAC-2026-0004');

INSERT INTO invoices (reference, client_id, issue_date, due_date, status, total_amount, paid_amount, remaining_amount, payment_method_note, notes)
SELECT 'FAC-2026-0005', c.id, '2026-03-18', '2026-04-01', 'DRAFT', 300.00, 0.00, 300.00, NULL, 'Brouillon de facturation'
FROM clients c
WHERE c.phone = '+221770001008'
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.reference = 'FAC-2026-0005');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
SELECT i.id, 'Routeur entreprise', 1.00, 500.00, 500.00
FROM invoices i
WHERE i.reference = 'FAC-2026-0001'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_items ii
    WHERE ii.invoice_id = i.id
      AND ii.description = 'Routeur entreprise'
  );

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
SELECT i.id, 'Configuration réseau', 1.00, 420.00, 420.00
FROM invoices i
WHERE i.reference = 'FAC-2026-0001'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_items ii
    WHERE ii.invoice_id = i.id
      AND ii.description = 'Configuration réseau'
  );

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
SELECT i.id, 'Pack vidéosurveillance', 1.00, 1500.00, 1500.00
FROM invoices i
WHERE i.reference = 'FAC-2026-0002'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_items ii
    WHERE ii.invoice_id = i.id
      AND ii.description = 'Pack vidéosurveillance'
  );

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
SELECT i.id, 'Maintenance imprimante', 3.00, 150.00, 450.00
FROM invoices i
WHERE i.reference = 'FAC-2026-0003'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_items ii
    WHERE ii.invoice_id = i.id
      AND ii.description = 'Maintenance imprimante'
  );

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
SELECT i.id, 'Caméras + installation', 1.00, 2200.00, 2200.00
FROM invoices i
WHERE i.reference = 'FAC-2026-0004'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_items ii
    WHERE ii.invoice_id = i.id
      AND ii.description = 'Caméras + installation'
  );

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total)
SELECT i.id, 'Intervention rapide', 2.00, 150.00, 300.00
FROM invoices i
WHERE i.reference = 'FAC-2026-0005'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_items ii
    WHERE ii.invoice_id = i.id
      AND ii.description = 'Intervention rapide'
  );

-- ---------------------------------------------------------------------------
-- 8) Payments
-- ---------------------------------------------------------------------------
INSERT INTO payments (invoice_id, client_id, payment_date, amount, method, payment_reference, notes)
SELECT i.id, i.client_id, '2026-03-10', 500.00, 'BANK_TRANSFER', 'PAY-2026-0001', 'Premier règlement'
FROM invoices i
WHERE i.reference = 'FAC-2026-0001'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.payment_reference = 'PAY-2026-0001');

INSERT INTO payments (invoice_id, client_id, payment_date, amount, method, payment_reference, notes)
SELECT i.id, i.client_id, '2026-03-13', 420.00, 'MOBILE_MONEY', 'PAY-2026-0002', 'Solde facture FAC-2026-0001'
FROM invoices i
WHERE i.reference = 'FAC-2026-0001'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.payment_reference = 'PAY-2026-0002');

INSERT INTO payments (invoice_id, client_id, payment_date, amount, method, payment_reference, notes)
SELECT i.id, i.client_id, '2026-03-15', 600.00, 'BANK_TRANSFER', 'PAY-2026-0003', 'Acompte'
FROM invoices i
WHERE i.reference = 'FAC-2026-0002'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.payment_reference = 'PAY-2026-0003');

-- ---------------------------------------------------------------------------
-- 9) Optional sync (safe even without triggers)
-- ---------------------------------------------------------------------------
UPDATE quotes q
JOIN (
  SELECT qi.quote_id, ROUND(SUM(qi.line_total), 2) AS subtotal_calc
  FROM quote_items qi
  GROUP BY qi.quote_id
) x ON x.quote_id = q.id
SET q.subtotal = x.subtotal_calc,
    q.total_amount = ROUND(x.subtotal_calc - q.discount_amount, 2)
WHERE q.reference LIKE 'DEV-2026-%';

UPDATE invoices i
LEFT JOIN (
  SELECT ii.invoice_id, ROUND(SUM(ii.line_total), 2) AS total_calc
  FROM invoice_items ii
  GROUP BY ii.invoice_id
) t ON t.invoice_id = i.id
LEFT JOIN (
  SELECT p.invoice_id, ROUND(SUM(p.amount), 2) AS paid_calc
  FROM payments p
  GROUP BY p.invoice_id
) p ON p.invoice_id = i.id
SET i.total_amount = COALESCE(t.total_calc, i.total_amount),
    i.paid_amount = COALESCE(p.paid_calc, 0.00),
    i.remaining_amount = ROUND(COALESCE(t.total_calc, i.total_amount) - COALESCE(p.paid_calc, 0.00), 2),
    i.status = CASE
      WHEN i.status = 'CANCELLED' THEN 'CANCELLED'
      WHEN i.status = 'DRAFT' AND COALESCE(p.paid_calc, 0.00) = 0 THEN 'DRAFT'
      WHEN COALESCE(p.paid_calc, 0.00) = 0 THEN 'UNPAID'
      WHEN COALESCE(p.paid_calc, 0.00) < COALESCE(t.total_calc, i.total_amount) THEN 'PARTIALLY_PAID'
      ELSE 'PAID'
    END
WHERE i.reference LIKE 'FAC-2026-%';

-- ---------------------------------------------------------------------------
-- 10) Summary
-- ---------------------------------------------------------------------------
SELECT 'roles' AS table_name, COUNT(*) AS total FROM roles
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL SELECT 'installed_equipments', COUNT(*) FROM installed_equipments
UNION ALL SELECT 'interventions', COUNT(*) FROM interventions
UNION ALL SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL SELECT 'quotes', COUNT(*) FROM quotes
UNION ALL SELECT 'quote_items', COUNT(*) FROM quote_items
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments;

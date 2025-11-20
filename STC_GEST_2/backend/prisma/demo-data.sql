USE stc_gets;

SET NAMES utf8mb4;

INSERT INTO Materiel (reference, nom, marque, modele, categorie, description, createdAt, updatedAt)
VALUES
  ('PC-DELL-5420', 'Laptop Dell Latitude 5420', 'Dell', 'Latitude 5420', 'Ordinateur portable', 'Poste bureautique professionnel pour équipes support et administration.', NOW(3), NOW(3)),
  ('RTR-TP-AX55', 'Routeur TP-Link Archer AX55', 'TP-Link', 'Archer AX55', 'Réseau', 'Routeur WiFi 6 pour petites agences et clients PME.', NOW(3), NOW(3)),
  ('PRN-HP-404', 'Imprimante HP LaserJet Pro M404', 'HP', 'LaserJet Pro M404', 'Impression', 'Imprimante laser monochrome pour bureaux et écoles.', NOW(3), NOW(3)),
  ('SCR-DELL-24', 'Écran Dell 24 pouces', 'Dell', 'P2422H', 'Écran', 'Moniteur Full HD pour postes administratifs.', NOW(3), NOW(3)),
  ('NAS-SYN-220', 'NAS Synology DS220+', 'Synology', 'DS220+', 'Stockage', 'Serveur de stockage local pour sauvegardes et partage de fichiers.', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  nom = VALUES(nom),
  marque = VALUES(marque),
  modele = VALUES(modele),
  categorie = VALUES(categorie),
  description = VALUES(description),
  updatedAt = NOW(3);

INSERT INTO Stock (
  materielId,
  numeroInventaire,
  codeBarresValeur,
  qrCodeValeur,
  quantiteActuelle,
  stockMinimum,
  emplacement,
  prixAchat,
  dateAchat,
  dateReception,
  datePremiereEntree,
  dateDerniereEntree,
  dateFinGarantie,
  createdAt,
  updatedAt
)
SELECT id, 'STC-2026-0001', 'STC-2026-0001', 'STC-2026-0001', 12, 3, 'Dakar - Dépôt A', 650000.00, '2026-01-12', '2026-01-18', '2026-01-18', '2026-05-01', '2028-01-18', NOW(3), NOW(3)
FROM Materiel WHERE reference = 'PC-DELL-5420'
ON DUPLICATE KEY UPDATE quantiteActuelle = VALUES(quantiteActuelle), stockMinimum = VALUES(stockMinimum), emplacement = VALUES(emplacement), prixAchat = VALUES(prixAchat), updatedAt = NOW(3);

INSERT INTO Stock (
  materielId,
  numeroInventaire,
  codeBarresValeur,
  qrCodeValeur,
  quantiteActuelle,
  stockMinimum,
  emplacement,
  prixAchat,
  dateAchat,
  dateReception,
  datePremiereEntree,
  dateDerniereEntree,
  dateFinGarantie,
  createdAt,
  updatedAt
)
SELECT id, 'STC-2026-0002', 'STC-2026-0002', 'STC-2026-0002', 2, 5, 'Dakar - Dépôt B', 55000.00, '2026-02-03', '2026-02-05', '2026-02-05', '2026-04-20', '2027-02-05', NOW(3), NOW(3)
FROM Materiel WHERE reference = 'RTR-TP-AX55'
ON DUPLICATE KEY UPDATE quantiteActuelle = VALUES(quantiteActuelle), stockMinimum = VALUES(stockMinimum), emplacement = VALUES(emplacement), prixAchat = VALUES(prixAchat), updatedAt = NOW(3);

INSERT INTO Stock (
  materielId,
  numeroInventaire,
  codeBarresValeur,
  qrCodeValeur,
  quantiteActuelle,
  stockMinimum,
  emplacement,
  prixAchat,
  dateAchat,
  dateReception,
  datePremiereEntree,
  dateDerniereEntree,
  dateFinGarantie,
  createdAt,
  updatedAt
)
SELECT id, 'STC-2026-0003', 'STC-2026-0003', 'STC-2026-0003', 0, 2, 'Thiès - Agence', 135000.00, '2026-02-14', '2026-02-19', '2026-02-19', '2026-03-11', '2027-02-19', NOW(3), NOW(3)
FROM Materiel WHERE reference = 'PRN-HP-404'
ON DUPLICATE KEY UPDATE quantiteActuelle = VALUES(quantiteActuelle), stockMinimum = VALUES(stockMinimum), emplacement = VALUES(emplacement), prixAchat = VALUES(prixAchat), updatedAt = NOW(3);

INSERT INTO Stock (
  materielId,
  numeroInventaire,
  codeBarresValeur,
  qrCodeValeur,
  quantiteActuelle,
  stockMinimum,
  emplacement,
  prixAchat,
  dateAchat,
  dateReception,
  datePremiereEntree,
  dateDerniereEntree,
  dateFinGarantie,
  createdAt,
  updatedAt
)
SELECT id, 'STC-2026-0004', 'STC-2026-0004', 'STC-2026-0004', 18, 4, 'Dakar - Dépôt A', 82000.00, '2026-03-02', '2026-03-05', '2026-03-05', '2026-05-08', '2028-03-05', NOW(3), NOW(3)
FROM Materiel WHERE reference = 'SCR-DELL-24'
ON DUPLICATE KEY UPDATE quantiteActuelle = VALUES(quantiteActuelle), stockMinimum = VALUES(stockMinimum), emplacement = VALUES(emplacement), prixAchat = VALUES(prixAchat), updatedAt = NOW(3);

INSERT INTO Stock (
  materielId,
  numeroInventaire,
  codeBarresValeur,
  qrCodeValeur,
  quantiteActuelle,
  stockMinimum,
  emplacement,
  prixAchat,
  dateAchat,
  dateReception,
  datePremiereEntree,
  dateDerniereEntree,
  dateFinGarantie,
  createdAt,
  updatedAt
)
SELECT id, 'STC-2026-0005', 'STC-2026-0005', 'STC-2026-0005', 4, 2, 'Dakar - Salle serveur', 245000.00, '2026-04-01', '2026-04-04', '2026-04-04', '2026-05-09', '2028-04-04', NOW(3), NOW(3)
FROM Materiel WHERE reference = 'NAS-SYN-220'
ON DUPLICATE KEY UPDATE quantiteActuelle = VALUES(quantiteActuelle), stockMinimum = VALUES(stockMinimum), emplacement = VALUES(emplacement), prixAchat = VALUES(prixAchat), updatedAt = NOW(3);

INSERT INTO MouvementStock (materielId, numeroInventaire, typeMouvement, quantite, prixUnitaire, dateMouvement, motif, referenceDocument, commentaire, createdAt, updatedAt)
SELECT m.id, s.numeroInventaire, 'ENTREE', 12, s.prixAchat, '2026-01-18 10:30:00.000', 'Réception commande initiale', 'BC-2026-001', 'Entrée initiale laptops support.', NOW(3), NOW(3)
FROM Materiel m JOIN Stock s ON s.materielId = m.id WHERE m.reference = 'PC-DELL-5420'
  AND NOT EXISTS (SELECT 1 FROM MouvementStock x WHERE x.referenceDocument = 'BC-2026-001');

INSERT INTO MouvementStock (materielId, numeroInventaire, typeMouvement, quantite, prixUnitaire, dateMouvement, motif, referenceDocument, commentaire, createdAt, updatedAt)
SELECT m.id, s.numeroInventaire, 'SORTIE', 3, s.prixAchat, '2026-05-01 14:00:00.000', 'Affectation projet client', 'BS-2026-014', 'Sortie pour installation PME.', NOW(3), NOW(3)
FROM Materiel m JOIN Stock s ON s.materielId = m.id WHERE m.reference = 'PC-DELL-5420'
  AND NOT EXISTS (SELECT 1 FROM MouvementStock x WHERE x.referenceDocument = 'BS-2026-014');

INSERT INTO MouvementStock (materielId, numeroInventaire, typeMouvement, quantite, prixUnitaire, dateMouvement, motif, referenceDocument, commentaire, createdAt, updatedAt)
SELECT m.id, s.numeroInventaire, 'ENTREE', 18, s.prixAchat, '2026-03-05 09:00:00.000', 'Réception écrans', 'BC-2026-022', 'Stock écran pour postes administratifs.', NOW(3), NOW(3)
FROM Materiel m JOIN Stock s ON s.materielId = m.id WHERE m.reference = 'SCR-DELL-24'
  AND NOT EXISTS (SELECT 1 FROM MouvementStock x WHERE x.referenceDocument = 'BC-2026-022');

INSERT INTO MouvementStock (materielId, numeroInventaire, typeMouvement, quantite, prixUnitaire, dateMouvement, motif, referenceDocument, commentaire, createdAt, updatedAt)
SELECT m.id, s.numeroInventaire, 'AJUSTEMENT', 2, s.prixAchat, '2026-05-10 16:10:00.000', 'Contrôle inventaire', 'INV-2026-001', 'Ajustement après inventaire physique.', NOW(3), NOW(3)
FROM Materiel m JOIN Stock s ON s.materielId = m.id WHERE m.reference = 'RTR-TP-AX55'
  AND NOT EXISTS (SELECT 1 FROM MouvementStock x WHERE x.referenceDocument = 'INV-2026-001');

INSERT INTO Inventaire (dateInventaire, commentaire, createdAt, updatedAt)
SELECT '2026-05-10 08:30:00.000', 'Inventaire de contrôle avant préparation des captures portfolio.', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM Inventaire WHERE commentaire = 'Inventaire de contrôle avant préparation des captures portfolio.');

INSERT INTO InventaireItem (inventaireId, materielId, quantiteTheorique, quantiteReelle, ecart, commentaire, createdAt, updatedAt)
SELECT i.id, m.id, s.quantiteActuelle, s.quantiteActuelle, 0, 'Stock conforme.', NOW(3), NOW(3)
FROM Inventaire i
JOIN Materiel m ON m.reference = 'PC-DELL-5420'
JOIN Stock s ON s.materielId = m.id
WHERE i.commentaire = 'Inventaire de contrôle avant préparation des captures portfolio.'
ON DUPLICATE KEY UPDATE quantiteTheorique = VALUES(quantiteTheorique), quantiteReelle = VALUES(quantiteReelle), ecart = VALUES(ecart), updatedAt = NOW(3);

INSERT INTO InventaireItem (inventaireId, materielId, quantiteTheorique, quantiteReelle, ecart, commentaire, createdAt, updatedAt)
SELECT i.id, m.id, s.quantiteActuelle, s.quantiteActuelle + 1, 1, 'Un routeur retrouvé en retour agence.', NOW(3), NOW(3)
FROM Inventaire i
JOIN Materiel m ON m.reference = 'RTR-TP-AX55'
JOIN Stock s ON s.materielId = m.id
WHERE i.commentaire = 'Inventaire de contrôle avant préparation des captures portfolio.'
ON DUPLICATE KEY UPDATE quantiteTheorique = VALUES(quantiteTheorique), quantiteReelle = VALUES(quantiteReelle), ecart = VALUES(ecart), commentaire = VALUES(commentaire), updatedAt = NOW(3);

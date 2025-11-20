import db from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { removeUploadedFile } from '../utils/fileUtils.js';
import {
  catalogueExists,
  duplicateCatalogueWithRelations,
  getCatalogueWithStructure
} from '../services/cataloguesService.js';
import { streamCataloguePdf } from '../utils/cataloguePdf.js';

const sanitize = (value) => (typeof value === 'string' ? value.trim() : value);

const parseNullableInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseOptionalNullableInt = (value) => {
  if (value === undefined) return undefined;
  return parseNullableInt(value);
};

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseOptionalNullableNumber = (value) => {
  if (value === undefined) return undefined;
  return parseNullableNumber(value);
};

const parseBooleanValue = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value ? 1 : 0;

  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'oui', 'on'].includes(normalized) ? 1 : 0;
};

const parseOptionalBooleanValue = (value) => {
  if (value === undefined) return undefined;
  return parseBooleanValue(value, 0);
};

const toMediaPath = (file) => (file?.filename ? `uploads/${file.filename}` : null);

const isValidProductType = (value) => ['hardware', 'software'].includes(value);

const validateCatalogueStatus = (status) => {
  const validStatuses = ['brouillon', 'publie', 'archive'];
  return validStatuses.includes(status) ? status : 'brouillon';
};

const parseItemsInput = (body) => {
  if (body.items === undefined) {
    return [body];
  }

  if (Array.isArray(body.items)) {
    return body.items;
  }

  if (typeof body.items === 'string') {
    try {
      const parsed = JSON.parse(body.items);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  return [body.items];
};

const ensureSectionBelongsToCatalogue = async (catalogueId, sectionId) => {
  if (!sectionId) return;

  const [rows] = await db.query(
    'SELECT id FROM catalogue_sections WHERE id = ? AND catalogue_id = ?',
    [sectionId, catalogueId]
  );

  if (!rows[0]) {
    throw new HttpError(400, 'Section invalide pour ce catalogue');
  }
};

const ensureProductExists = async (typeProduit, produitId) => {
  if (typeProduit === 'hardware') {
    const [rows] = await db.query('SELECT id FROM hardware WHERE id = ?', [produitId]);
    if (!rows[0]) {
      throw new HttpError(400, `Matériel introuvable: ${produitId}`);
    }
    return;
  }

  const [rows] = await db.query('SELECT id FROM software WHERE id = ?', [produitId]);
  if (!rows[0]) {
    throw new HttpError(400, `Logiciel introuvable: ${produitId}`);
  }
};

export const getCatalogues = asyncHandler(async (req, res) => {
  const { q, statut, type_client_id } = req.query;

  const where = [];
  const params = [];

  if (q) {
    where.push('(c.nom LIKE ? OR c.titre LIKE ? OR c.sous_titre LIKE ?)');
    const search = `%${q}%`;
    params.push(search, search, search);
  }

  if (statut) {
    where.push('c.statut = ?');
    params.push(statut);
  }

  if (type_client_id) {
    where.push('c.type_client_id = ?');
    params.push(type_client_id);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await db.query(
    `
      SELECT
        c.*,
        tc.nom AS type_client_nom,
        (
          SELECT COUNT(*)
          FROM catalogue_sections cs
          WHERE cs.catalogue_id = c.id
        ) AS sections_count,
        (
          SELECT COUNT(*)
          FROM catalogue_items ci
          WHERE ci.catalogue_id = c.id
        ) AS items_count,
        (
          SELECT ROUND(
            SUM(
              CASE
                WHEN ci.visible = 1 THEN
                  (
                    CASE
                      WHEN ci.prix_personnalise IS NOT NULL THEN ci.prix_personnalise
                      WHEN ci.type_produit = 'hardware' THEN h.sale_price
                      ELSE sw.price
                    END
                  ) * (1 - COALESCE(ci.remise, 0) / 100)
                ELSE 0
              END
            ),
            2
          )
          FROM catalogue_items ci
          LEFT JOIN hardware h ON ci.type_produit = 'hardware' AND h.id = ci.produit_id
          LEFT JOIN software sw ON ci.type_produit = 'software' AND sw.id = ci.produit_id
          WHERE ci.catalogue_id = c.id
        ) AS total_price
      FROM catalogues c
      LEFT JOIN types_clients tc ON tc.id = c.type_client_id
      ${whereSql}
      ORDER BY c.updated_at DESC
    `,
    params
  );

  res.json({
    success: true,
    data: rows
  });
});

export const getCatalogueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await getCatalogueWithStructure(id, { onlyVisible: false });
  if (!data) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  res.json({
    success: true,
    data
  });
});

export const createCatalogue = asyncHandler(async (req, res) => {
  const files = req.files || {};

  const payload = {
    nom: sanitize(req.body.nom),
    titre: sanitize(req.body.titre),
    sous_titre: sanitize(req.body.sous_titre) || null,
    description: sanitize(req.body.description) || null,
    type_client_id: parseNullableInt(req.body.type_client_id),
    logo: toMediaPath(files.logo?.[0]),
    image_couverture: toMediaPath(files.image_couverture?.[0]),
    theme: sanitize(req.body.theme) || 'standard',
    afficher_prix: parseBooleanValue(req.body.afficher_prix, 1),
    afficher_references: parseBooleanValue(req.body.afficher_references, 1),
    afficher_caracteristiques: parseBooleanValue(req.body.afficher_caracteristiques, 1),
    message_final: sanitize(req.body.message_final) || null,
    pied_de_page: sanitize(req.body.pied_de_page) || null,
    statut: validateCatalogueStatus(sanitize(req.body.statut) || 'brouillon')
  };

  if (!payload.nom || !payload.titre) {
    throw new HttpError(400, 'Les champs nom et titre sont requis');
  }

  if (payload.type_client_id) {
    const [typeRows] = await db.query('SELECT id FROM types_clients WHERE id = ?', [payload.type_client_id]);
    if (!typeRows[0]) {
      throw new HttpError(400, 'Type client invalide');
    }
  }

  const [result] = await db.query(
    `
      INSERT INTO catalogues (
        nom,
        titre,
        sous_titre,
        description,
        type_client_id,
        logo,
        image_couverture,
        theme,
        afficher_prix,
        afficher_references,
        afficher_caracteristiques,
        message_final,
        pied_de_page,
        statut
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.nom,
      payload.titre,
      payload.sous_titre,
      payload.description,
      payload.type_client_id,
      payload.logo,
      payload.image_couverture,
      payload.theme,
      payload.afficher_prix,
      payload.afficher_references,
      payload.afficher_caracteristiques,
      payload.message_final,
      payload.pied_de_page,
      payload.statut
    ]
  );

  const data = await getCatalogueWithStructure(result.insertId, { onlyVisible: false });

  res.status(201).json({
    success: true,
    message: 'Catalogue créé avec succès',
    data
  });
});

export const updateCatalogue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files || {};

  const [rows] = await db.query('SELECT * FROM catalogues WHERE id = ?', [id]);
  const existing = rows[0];

  if (!existing) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  let logoPath = existing.logo;
  let coverPath = existing.image_couverture;

  if (files.logo?.[0]) {
    logoPath = toMediaPath(files.logo[0]);
    await removeUploadedFile(existing.logo);
  }

  if (files.image_couverture?.[0]) {
    coverPath = toMediaPath(files.image_couverture[0]);
    await removeUploadedFile(existing.image_couverture);
  }

  if (parseBooleanValue(req.body.clear_logo, 0)) {
    await removeUploadedFile(logoPath);
    logoPath = null;
  }

  if (parseBooleanValue(req.body.clear_image_couverture, 0)) {
    await removeUploadedFile(coverPath);
    coverPath = null;
  }

  const typeClientId =
    req.body.type_client_id === undefined
      ? existing.type_client_id
      : parseNullableInt(req.body.type_client_id);

  if (typeClientId) {
    const [typeRows] = await db.query('SELECT id FROM types_clients WHERE id = ?', [typeClientId]);
    if (!typeRows[0]) {
      throw new HttpError(400, 'Type client invalide');
    }
  }

  const payload = {
    nom: sanitize(req.body.nom) ?? existing.nom,
    titre: sanitize(req.body.titre) ?? existing.titre,
    sous_titre: sanitize(req.body.sous_titre) ?? existing.sous_titre,
    description: sanitize(req.body.description) ?? existing.description,
    type_client_id: typeClientId,
    logo: logoPath,
    image_couverture: coverPath,
    theme: sanitize(req.body.theme) ?? existing.theme,
    afficher_prix:
      parseOptionalBooleanValue(req.body.afficher_prix) ?? Number(existing.afficher_prix || 0),
    afficher_references:
      parseOptionalBooleanValue(req.body.afficher_references) ?? Number(existing.afficher_references || 0),
    afficher_caracteristiques:
      parseOptionalBooleanValue(req.body.afficher_caracteristiques) ??
      Number(existing.afficher_caracteristiques || 0),
    message_final: sanitize(req.body.message_final) ?? existing.message_final,
    pied_de_page: sanitize(req.body.pied_de_page) ?? existing.pied_de_page,
    statut: req.body.statut ? validateCatalogueStatus(sanitize(req.body.statut)) : existing.statut
  };

  if (!payload.nom || !payload.titre) {
    throw new HttpError(400, 'Les champs nom et titre sont requis');
  }

  await db.query(
    `
      UPDATE catalogues
      SET
        nom = ?,
        titre = ?,
        sous_titre = ?,
        description = ?,
        type_client_id = ?,
        logo = ?,
        image_couverture = ?,
        theme = ?,
        afficher_prix = ?,
        afficher_references = ?,
        afficher_caracteristiques = ?,
        message_final = ?,
        pied_de_page = ?,
        statut = ?
      WHERE id = ?
    `,
    [
      payload.nom,
      payload.titre,
      payload.sous_titre,
      payload.description,
      payload.type_client_id,
      payload.logo,
      payload.image_couverture,
      payload.theme,
      payload.afficher_prix,
      payload.afficher_references,
      payload.afficher_caracteristiques,
      payload.message_final,
      payload.pied_de_page,
      payload.statut,
      id
    ]
  );

  const data = await getCatalogueWithStructure(id, { onlyVisible: false });

  res.json({
    success: true,
    message: 'Catalogue mis à jour',
    data
  });
});

export const deleteCatalogue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query('SELECT id, logo, image_couverture FROM catalogues WHERE id = ?', [id]);
  const catalogue = rows[0];

  if (!catalogue) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  const [itemRows] = await db.query(
    `
      SELECT image_specifique
      FROM catalogue_items
      WHERE catalogue_id = ?
        AND image_specifique IS NOT NULL
    `,
    [id]
  );

  await db.query('DELETE FROM catalogues WHERE id = ?', [id]);

  await removeUploadedFile(catalogue.logo);
  await removeUploadedFile(catalogue.image_couverture);
  await Promise.all(itemRows.map((item) => removeUploadedFile(item.image_specifique)));

  res.json({
    success: true,
    message: 'Catalogue supprimé'
  });
});

export const duplicateCatalogue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const duplicateId = await duplicateCatalogueWithRelations(id);
  if (!duplicateId) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  const data = await getCatalogueWithStructure(duplicateId, { onlyVisible: false });

  res.status(201).json({
    success: true,
    message: 'Catalogue dupliqué',
    data
  });
});

export const getCataloguePreview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await getCatalogueWithStructure(id, { onlyVisible: true });
  if (!data) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  res.json({
    success: true,
    data
  });
});

export const exportCataloguePdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await getCatalogueWithStructure(id, { onlyVisible: true });
  if (!data) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  streamCataloguePdf({ data, res });
});

export const createCatalogueSection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exists = await catalogueExists(id);
  if (!exists) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  const nom = sanitize(req.body.nom);
  const description = sanitize(req.body.description) || null;

  if (!nom) {
    throw new HttpError(400, 'Le nom de section est requis');
  }

  const ordre = parseNullableInt(req.body.ordre);
  let finalOrder = ordre;

  if (finalOrder === null) {
    const [maxRows] = await db.query(
      'SELECT COALESCE(MAX(ordre), 0) + 1 AS next_order FROM catalogue_sections WHERE catalogue_id = ?',
      [id]
    );
    finalOrder = Number(maxRows[0].next_order || 1);
  }

  const [result] = await db.query(
    `
      INSERT INTO catalogue_sections (catalogue_id, nom, description, ordre)
      VALUES (?, ?, ?, ?)
    `,
    [id, nom, description, finalOrder]
  );

  const [rows] = await db.query('SELECT * FROM catalogue_sections WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Section créée',
    data: rows[0]
  });
});

export const updateCatalogueSection = asyncHandler(async (req, res) => {
  const { id, sectionId } = req.params;

  const [rows] = await db.query(
    'SELECT * FROM catalogue_sections WHERE id = ? AND catalogue_id = ?',
    [sectionId, id]
  );

  const existing = rows[0];
  if (!existing) {
    throw new HttpError(404, 'Section introuvable');
  }

  const payload = {
    nom: sanitize(req.body.nom) ?? existing.nom,
    description: sanitize(req.body.description) ?? existing.description,
    ordre: parseOptionalNullableInt(req.body.ordre) ?? existing.ordre
  };

  if (!payload.nom) {
    throw new HttpError(400, 'Le nom de section est requis');
  }

  await db.query(
    `
      UPDATE catalogue_sections
      SET nom = ?, description = ?, ordre = ?
      WHERE id = ?
    `,
    [payload.nom, payload.description, payload.ordre, sectionId]
  );

  const [updatedRows] = await db.query('SELECT * FROM catalogue_sections WHERE id = ?', [sectionId]);

  res.json({
    success: true,
    message: 'Section mise à jour',
    data: updatedRows[0]
  });
});

export const deleteCatalogueSection = asyncHandler(async (req, res) => {
  const { id, sectionId } = req.params;

  const [rows] = await db.query(
    'SELECT id FROM catalogue_sections WHERE id = ? AND catalogue_id = ?',
    [sectionId, id]
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Section introuvable');
  }

  await db.query('DELETE FROM catalogue_sections WHERE id = ?', [sectionId]);

  res.json({
    success: true,
    message: 'Section supprimée'
  });
});

export const addCatalogueItems = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exists = await catalogueExists(id);
  if (!exists) {
    throw new HttpError(404, 'Catalogue introuvable');
  }

  const itemsInput = parseItemsInput(req.body);

  if (!itemsInput.length) {
    throw new HttpError(400, 'Aucun item à ajouter');
  }

  if (req.file && itemsInput.length > 1) {
    throw new HttpError(400, 'Upload image spécifique non supporté en ajout multiple');
  }

  const [maxRows] = await db.query(
    'SELECT COALESCE(MAX(ordre), 0) AS max_order FROM catalogue_items WHERE catalogue_id = ?',
    [id]
  );

  let nextOrder = Number(maxRows[0].max_order || 0) + 1;
  const inserted = [];
  const skipped = [];

  for (let index = 0; index < itemsInput.length; index += 1) {
    const item = itemsInput[index];
    try {
      const typeProduit = sanitize(item.type_produit || item.type);
      const produitId = parseNullableInt(item.produit_id ?? item.id);

      if (!isValidProductType(typeProduit) || !produitId) {
        skipped.push({
          item,
          reason: 'Type produit ou produit_id invalide'
        });
        continue;
      }

      const sectionId = parseNullableInt(item.section_id);

      if (sectionId) {
        await ensureSectionBelongsToCatalogue(id, sectionId);
      }

      await ensureProductExists(typeProduit, produitId);

      const [existingRows] = await db.query(
        `
          SELECT id
          FROM catalogue_items
          WHERE catalogue_id = ?
            AND type_produit = ?
            AND produit_id = ?
        `,
        [id, typeProduit, produitId]
      );

      if (existingRows[0]) {
        skipped.push({
          item,
          reason: 'Produit déjà présent dans ce catalogue'
        });
        continue;
      }

      const finalOrder = parseNullableInt(item.ordre) ?? nextOrder;
      nextOrder = finalOrder + 1;

      const imageSpecifique = req.file && index === 0 ? toMediaPath(req.file) : null;

      const [result] = await db.query(
        `
          INSERT INTO catalogue_items (
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
            mise_en_avant,
            image_specifique
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          sectionId,
          produitId,
          typeProduit,
          finalOrder,
          parseNullableNumber(item.prix_personnalise),
          sanitize(item.titre_personnalise) || null,
          sanitize(item.description_personnalisee) || null,
          sanitize(item.note_commerciale) || null,
          parseNullableNumber(item.remise),
          parseBooleanValue(item.visible, 1),
          parseBooleanValue(item.mise_en_avant, 0),
          imageSpecifique
        ]
      );

      inserted.push(result.insertId);
    } catch (error) {
      skipped.push({
        item,
        reason: error.message || 'Erreur lors de l’ajout de l’item'
      });
    }
  }

  if (!inserted.length) {
    throw new HttpError(400, 'Aucun item ajouté');
  }

  const placeholders = inserted.map(() => '?').join(', ');
  const [rows] = await db.query(
    `
      SELECT *
      FROM catalogue_items
      WHERE id IN (${placeholders})
      ORDER BY ordre, created_at
    `,
    inserted
  );

  res.status(201).json({
    success: true,
    message: 'Items ajoutés au catalogue',
    data: {
      inserted: rows,
      skipped
    }
  });
});

export const updateCatalogueItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;

  const [rows] = await db.query(
    'SELECT * FROM catalogue_items WHERE id = ? AND catalogue_id = ?',
    [itemId, id]
  );
  const existing = rows[0];

  if (!existing) {
    throw new HttpError(404, 'Item catalogue introuvable');
  }

  let imageSpecifique = existing.image_specifique;

  if (req.file) {
    imageSpecifique = toMediaPath(req.file);
    await removeUploadedFile(existing.image_specifique);
  }

  if (parseBooleanValue(req.body.clear_image_specifique, 0)) {
    await removeUploadedFile(imageSpecifique);
    imageSpecifique = null;
  }

  const sectionId =
    req.body.section_id === undefined ? existing.section_id : parseNullableInt(req.body.section_id);

  if (sectionId) {
    await ensureSectionBelongsToCatalogue(id, sectionId);
  }

  const payload = {
    section_id: sectionId,
    ordre: parseOptionalNullableInt(req.body.ordre) ?? existing.ordre,
    prix_personnalise:
      parseOptionalNullableNumber(req.body.prix_personnalise) ?? existing.prix_personnalise,
    titre_personnalise: sanitize(req.body.titre_personnalise) ?? existing.titre_personnalise,
    description_personnalisee:
      sanitize(req.body.description_personnalisee) ?? existing.description_personnalisee,
    note_commerciale: sanitize(req.body.note_commerciale) ?? existing.note_commerciale,
    remise: parseOptionalNullableNumber(req.body.remise) ?? existing.remise,
    visible: parseOptionalBooleanValue(req.body.visible) ?? Number(existing.visible || 0),
    mise_en_avant:
      parseOptionalBooleanValue(req.body.mise_en_avant) ?? Number(existing.mise_en_avant || 0),
    image_specifique: imageSpecifique
  };

  await db.query(
    `
      UPDATE catalogue_items
      SET
        section_id = ?,
        ordre = ?,
        prix_personnalise = ?,
        titre_personnalise = ?,
        description_personnalisee = ?,
        note_commerciale = ?,
        remise = ?,
        visible = ?,
        mise_en_avant = ?,
        image_specifique = ?
      WHERE id = ?
    `,
    [
      payload.section_id,
      payload.ordre,
      payload.prix_personnalise,
      payload.titre_personnalise,
      payload.description_personnalisee,
      payload.note_commerciale,
      payload.remise,
      payload.visible,
      payload.mise_en_avant,
      payload.image_specifique,
      itemId
    ]
  );

  const [updatedRows] = await db.query('SELECT * FROM catalogue_items WHERE id = ?', [itemId]);

  res.json({
    success: true,
    message: 'Item catalogue mis à jour',
    data: updatedRows[0]
  });
});

export const deleteCatalogueItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;

  const [rows] = await db.query(
    'SELECT id, image_specifique FROM catalogue_items WHERE id = ? AND catalogue_id = ?',
    [itemId, id]
  );

  const existing = rows[0];
  if (!existing) {
    throw new HttpError(404, 'Item catalogue introuvable');
  }

  await db.query('DELETE FROM catalogue_items WHERE id = ?', [itemId]);
  await removeUploadedFile(existing.image_specifique);

  res.json({
    success: true,
    message: 'Item catalogue supprimé'
  });
});

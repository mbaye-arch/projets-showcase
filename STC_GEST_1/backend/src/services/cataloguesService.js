import db from '../config/db.js';

const computeItemCharacteristics = (item) => {
  if (item.type_produit === 'hardware') {
    return [item.hardware_brand, item.hardware_model, item.hardware_type, item.condition_state]
      .filter(Boolean)
      .join(' • ');
  }

  return [item.software_type, item.software_compatibility].filter(Boolean).join(' • ');
};

const normalizeCatalogueItem = (item) => {
  const basePrice = item.prix_personnalise ?? item.default_price ?? null;
  const discount = Number(item.remise || 0);

  let finalPrice = basePrice;
  if (basePrice !== null && discount > 0) {
    finalPrice = Number(basePrice) * (1 - discount / 100);
  }

  return {
    id: item.id,
    catalogue_id: item.catalogue_id,
    section_id: item.section_id,
    type_produit: item.type_produit,
    produit_id: item.produit_id,
    ordre: item.ordre,
    prix_personnalise: item.prix_personnalise,
    remise: item.remise,
    visible: Boolean(item.visible),
    mise_en_avant: Boolean(item.mise_en_avant),
    titre_personnalise: item.titre_personnalise,
    description_personnalisee: item.description_personnalisee,
    note_commerciale: item.note_commerciale,
    image_specifique: item.image_specifique,
    created_at: item.created_at,
    updated_at: item.updated_at,
    display: {
      title: item.titre_personnalise || item.product_name || 'Produit indisponible',
      description:
        item.description_personnalisee || item.product_description || 'Description non disponible',
      reference: item.product_reference || null,
      category: item.product_category || null,
      supplier: item.type_produit === 'hardware' ? item.supplier_name || null : item.software_vendor || null,
      characteristics: computeItemCharacteristics(item),
      default_price: item.default_price,
      final_price: finalPrice,
      image: item.image_specifique || item.default_image || null,
      product_name: item.product_name || null,
      type_label: item.type_produit === 'hardware' ? 'Matériel' : 'Logiciel'
    }
  };
};

const computeCatalogueTotals = (items) => {
  const withPrice = items.filter(
    (item) => item.display?.final_price !== null && item.display?.final_price !== undefined
  );

  const visibleWithPrice = withPrice.filter((item) => item.visible);

  const totalVisible = visibleWithPrice.reduce(
    (sum, item) => sum + Number(item.display.final_price || 0),
    0
  );
  const totalAll = withPrice.reduce((sum, item) => sum + Number(item.display.final_price || 0), 0);

  const hardwareTotal = visibleWithPrice
    .filter((item) => item.type_produit === 'hardware')
    .reduce((sum, item) => sum + Number(item.display.final_price || 0), 0);

  const softwareTotal = visibleWithPrice
    .filter((item) => item.type_produit === 'software')
    .reduce((sum, item) => sum + Number(item.display.final_price || 0), 0);

  return {
    total_visible: totalVisible,
    total_all: totalAll,
    hardware_visible: hardwareTotal,
    software_visible: softwareTotal,
    items_with_price: withPrice.length,
    visible_items_with_price: visibleWithPrice.length
  };
};

const fetchCatalogueItems = async (catalogueId, onlyVisible) => {
  const whereVisibility = onlyVisible ? 'AND ci.visible = 1' : '';

  const [itemRows] = await db.query(
    `
      SELECT
        ci.*,
        cs.nom AS section_nom,
        cs.ordre AS section_ordre,

        CASE
          WHEN ci.type_produit = 'hardware' THEN h.name
          ELSE sw.name
        END AS product_name,

        CASE
          WHEN ci.type_produit = 'hardware' THEN h.reference
          ELSE NULL
        END AS product_reference,

        CASE
          WHEN ci.type_produit = 'hardware' THEN h.description
          ELSE sw.description
        END AS product_description,

        CASE
          WHEN ci.type_produit = 'hardware' THEN h.sale_price
          ELSE sw.price
        END AS default_price,

        CASE
          WHEN ci.type_produit = 'hardware' THEN h.main_image
          ELSE NULL
        END AS default_image,

        CASE
          WHEN ci.type_produit = 'hardware' THEN cat_h.name
          ELSE cat_sw.name
        END AS product_category,

        s.name AS supplier_name,
        sw.vendor_name AS software_vendor,

        h.hardware_type,
        h.brand AS hardware_brand,
        h.model AS hardware_model,
        h.condition_state,

        sw.software_type,
        sw.compatibility AS software_compatibility
      FROM catalogue_items ci
      LEFT JOIN catalogue_sections cs ON cs.id = ci.section_id
      LEFT JOIN hardware h ON ci.type_produit = 'hardware' AND h.id = ci.produit_id
      LEFT JOIN software sw ON ci.type_produit = 'software' AND sw.id = ci.produit_id
      LEFT JOIN categories cat_h ON cat_h.id = h.category_id
      LEFT JOIN categories cat_sw ON cat_sw.id = sw.category_id
      LEFT JOIN suppliers s ON s.id = h.supplier_id
      WHERE ci.catalogue_id = ?
      ${whereVisibility}
      ORDER BY COALESCE(cs.ordre, 99999), ci.ordre, ci.created_at
    `,
    [catalogueId]
  );

  return itemRows.map(normalizeCatalogueItem);
};

export const getCatalogueWithStructure = async (catalogueId, options = {}) => {
  const onlyVisible = Boolean(options.onlyVisible);

  const [catalogueRows] = await db.query(
    `
      SELECT
        c.*,
        tc.nom AS type_client_nom,
        tc.description AS type_client_description
      FROM catalogues c
      LEFT JOIN types_clients tc ON tc.id = c.type_client_id
      WHERE c.id = ?
    `,
    [catalogueId]
  );

  const catalogue = catalogueRows[0];
  if (!catalogue) return null;

  const [sectionsRows] = await db.query(
    `
      SELECT id, catalogue_id, nom, description, ordre, created_at, updated_at
      FROM catalogue_sections
      WHERE catalogue_id = ?
      ORDER BY ordre, created_at
    `,
    [catalogueId]
  );

  const items = await fetchCatalogueItems(catalogueId, onlyVisible);
  const totals = computeCatalogueTotals(items);

  const sectionMap = new Map(
    sectionsRows.map((section) => [
      section.id,
      {
        ...section,
        items: []
      }
    ])
  );

  const unassignedSection = {
    id: null,
    catalogue_id: Number(catalogueId),
    nom: 'Autres produits',
    description: 'Produits non assignés à une section',
    ordre: 99999,
    items: []
  };

  for (const item of items) {
    if (item.section_id && sectionMap.has(item.section_id)) {
      sectionMap.get(item.section_id).items.push(item);
    } else {
      unassignedSection.items.push(item);
    }
  }

  const sections = Array.from(sectionMap.values());
  if (unassignedSection.items.length) {
    sections.push(unassignedSection);
  }

  return {
    catalogue: {
      ...catalogue,
      afficher_prix: Boolean(catalogue.afficher_prix),
      afficher_references: Boolean(catalogue.afficher_references),
      afficher_caracteristiques: Boolean(catalogue.afficher_caracteristiques)
    },
    sections,
    items_count: items.length,
    section_count: sectionsRows.length,
    totals
  };
};

export const duplicateCatalogueWithRelations = async (catalogueId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [catalogueRows] = await connection.query('SELECT * FROM catalogues WHERE id = ?', [catalogueId]);
    const sourceCatalogue = catalogueRows[0];

    if (!sourceCatalogue) {
      await connection.rollback();
      return null;
    }

    const [duplicateResult] = await connection.query(
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
        `${sourceCatalogue.nom} (copie ${Date.now()})`,
        sourceCatalogue.titre,
        sourceCatalogue.sous_titre,
        sourceCatalogue.description,
        sourceCatalogue.type_client_id,
        sourceCatalogue.logo,
        sourceCatalogue.image_couverture,
        sourceCatalogue.theme,
        sourceCatalogue.afficher_prix,
        sourceCatalogue.afficher_references,
        sourceCatalogue.afficher_caracteristiques,
        sourceCatalogue.message_final,
        sourceCatalogue.pied_de_page,
        'brouillon'
      ]
    );

    const duplicateCatalogueId = duplicateResult.insertId;

    const [sectionsRows] = await connection.query(
      'SELECT * FROM catalogue_sections WHERE catalogue_id = ? ORDER BY ordre, created_at',
      [catalogueId]
    );

    const sectionIdMap = new Map();

    for (const section of sectionsRows) {
      const [newSectionResult] = await connection.query(
        `
          INSERT INTO catalogue_sections (catalogue_id, nom, description, ordre)
          VALUES (?, ?, ?, ?)
        `,
        [duplicateCatalogueId, section.nom, section.description, section.ordre]
      );

      sectionIdMap.set(section.id, newSectionResult.insertId);
    }

    const [itemsRows] = await connection.query(
      'SELECT * FROM catalogue_items WHERE catalogue_id = ? ORDER BY ordre, created_at',
      [catalogueId]
    );

    for (const item of itemsRows) {
      await connection.query(
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
          duplicateCatalogueId,
          item.section_id ? sectionIdMap.get(item.section_id) || null : null,
          item.produit_id,
          item.type_produit,
          item.ordre,
          item.prix_personnalise,
          item.titre_personnalise,
          item.description_personnalisee,
          item.note_commerciale,
          item.remise,
          item.visible,
          item.mise_en_avant,
          item.image_specifique
        ]
      );
    }

    await connection.commit();

    return duplicateCatalogueId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const catalogueExists = async (catalogueId) => {
  const [rows] = await db.query('SELECT id FROM catalogues WHERE id = ?', [catalogueId]);
  return Boolean(rows[0]);
};

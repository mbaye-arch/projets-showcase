import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pool from '../src/config/db.js';

const SOURCE_BASE_URL = 'https://www.cartouche-de-toner.fr';
const DEFAULT_QUERIES = ['207A', '207X', 'W2210A', 'W2211A', 'W2212A', 'W2213A'];
const DEFAULT_LIMIT = 60;

const EUR_TO_XOF = 655.957;
const PURCHASE_OFFSET_XOF = 5000;
const SALE_OFFSET_XOF = 10000;

const DELAY_MS = 220;

const COMPATIBILITY_NOTES = [
  'COMPATIBLE avec les imprimantes suivantes',
  'Color LaserJet Pro M255dw',
  'Color LaserJet Pro M255nw',
  'Color LaserJet Pro MFP M282nw',
  'Color LaserJet Pro MFP M283cdw',
  'Color LaserJet Pro MFP M283fdn',
  'Color LaserJet Pro MFP M283fdw'
].join('\n');

const parseCliArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    limit: DEFAULT_LIMIT,
    queries: [...DEFAULT_QUERIES]
  };

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      const value = Number(arg.split('=')[1]);
      if (Number.isFinite(value) && value > 0) {
        options.limit = Math.min(Math.floor(value), 250);
      }
      continue;
    }

    if (arg.startsWith('--queries=')) {
      const list = arg
        .split('=')[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (list.length > 0) {
        options.queries = list;
      }
    }
  }

  return options;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const decodeHtmlEntities = (value = '') =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));

const stripTags = (value = '') =>
  decodeHtmlEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeText = (value = '') =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'accept-language': 'fr-FR,fr;q=0.9'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} sur ${url}`);
  }

  return response.text();
};

const fetchBinary = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      referer: SOURCE_BASE_URL
    }
  });

  if (!response.ok) {
    throw new Error(`Téléchargement image échoué (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const extractProductUrlsFromSearchPage = (html) => {
  const absolute = [...html.matchAll(/href="(https:\/\/www\.cartouche-de-toner\.fr\/\d+-[^"]+\.html)"/gi)].map(
    (match) => match[1]
  );

  const relative = [...html.matchAll(/href="(\/\d+-[^"]+\.html)"/gi)].map((match) => `${SOURCE_BASE_URL}${match[1]}`);

  return [...absolute, ...relative];
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalized = String(value).replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatColorTitle = (color) => {
  if (color === 'NOIR') return 'Noir';
  if (color === 'JAUNE') return 'Jaune';
  if (color === 'CYAN') return 'Cyan';
  if (color === 'MAGENTA') return 'Magenta';
  return color;
};

const extractColorInfo = (normalizedTitle) => {
  const colorOrder = ['NOIR', 'JAUNE', 'CYAN', 'MAGENTA'];
  const qtyMap = new Map();
  const qtyRegex = /(\d+)\s*(NOIR(?:E|ES)?|JAUNE|CYAN|MAGENTA)/g;

  let match;
  while ((match = qtyRegex.exec(normalizedTitle)) !== null) {
    const qty = Number(match[1]);
    const rawColor = match[2];
    const color = rawColor.startsWith('NOIR') ? 'NOIR' : rawColor;
    qtyMap.set(color, (qtyMap.get(color) || 0) + qty);
  }

  if (qtyMap.size > 0) {
    const ordered = colorOrder.filter((c) => qtyMap.has(c));
    return {
      colors: ordered,
      qtyMap,
      token: ordered.map((c) => `${qtyMap.get(c)}${c}`).join('_'),
      label: ordered.map((c) => `${qtyMap.get(c)} ${formatColorTitle(c)}`).join(', ')
    };
  }

  const present = colorOrder.filter((color) =>
    color === 'NOIR' ? /\bNOIR(?:E|ES)?\b/.test(normalizedTitle) : new RegExp(`\\b${color}\\b`).test(normalizedTitle)
  );

  if (present.length === 0) {
    return {
      colors: ['NOIR', 'JAUNE', 'CYAN', 'MAGENTA'],
      qtyMap: null,
      token: 'NOIR_JAUNE_CYAN_MAGENTA',
      label: 'Noir, Jaune, Cyan, Magenta'
    };
  }

  return {
    colors: present,
    qtyMap: null,
    token: present.join('_'),
    label: present.map((c) => formatColorTitle(c)).join(', ')
  };
};

const dedupe = (arr) => Array.from(new Set(arr));

const computeYieldsText = ({ series, colors, packCount }) => {
  const blackYield = series === '207X' ? 3150 : 1350;
  const colorYield = series === '207X' ? 2450 : 1250;

  const hasBlack = colors.includes('NOIR');
  const hasOther = colors.some((c) => c !== 'NOIR');

  if (packCount && packCount > 1) {
    if (hasBlack && hasOther) {
      const colorCount = Math.max(1, packCount - 1);
      return `${blackYield} pages + ${colorCount} x ${colorYield} pages`;
    }
    if (hasBlack) {
      return `${packCount} x ${blackYield} pages`;
    }
    return `${packCount} x ${colorYield} pages`;
  }

  if (hasBlack && !hasOther) return `${blackYield} pages`;
  return `${colorYield} pages`;
};

const buildComposition = ({ series, codes, packCount }) => {
  if (codes.length > 0) return codes.join(', ');

  const suffix = series === '207X' ? 'X' : 'A';
  if (packCount && packCount > 1) {
    return [`W2210${suffix}`, `W2211${suffix}`, `W2212${suffix}`, `W2213${suffix}`].join(', ');
  }

  return `W2210${suffix}`;
};

const buildReference = ({ series, primaryCode, packCount, statusToken, colorToken }) => {
  const parts = ['HP', series];
  if (primaryCode) parts.push(primaryCode);
  if (packCount && packCount > 1) parts.push(`PACK_${packCount}`);
  parts.push(statusToken);
  if (colorToken) parts.push(colorToken);

  return parts.join('_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120);
};

const buildDescription = ({
  statusLabel,
  series,
  colorLabel,
  yieldsText,
  quantityText,
  composition,
  sourceUrl
}) =>
  [
    'Fiche technique',
    'Marque HP',
    `Consommable ${statusLabel}`,
    `Référence commerciale ${series}`,
    `Couleur ${colorLabel}`,
    `Nombre de pages ${yieldsText}`,
    'Type de consommable Toner',
    "Technologie d'impression Laser",
    `Quantité incluse ${quantityText}`,
    `Composition du pack ${composition}`,
    `URL source ${sourceUrl}`
  ].join('\n');

const convertEurToBusinessXof = (priceEur) => {
  const base = priceEur * EUR_TO_XOF;
  const purchase = Math.round((base + PURCHASE_OFFSET_XOF) / 500) * 500;
  const sale = Math.round((base + SALE_OFFSET_XOF) / 500) * 500;
  return {
    purchase,
    sale,
    base
  };
};

const parseProductPage = ({ url, html }) => {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const dataLayerMatch = html.match(/let\s+cdcDatalayer\s*=\s*(\{[\s\S]*?\});/i);

  const title = stripTags(titleMatch?.[1] || '').slice(0, 180);
  if (!title) return null;

  const normalizedTitle = normalizeText(title);
  const dataLayer = dataLayerMatch ? safeJsonParse(dataLayerMatch[1]) : null;
  const item = dataLayer?.ecommerce?.items?.[0] || null;
  const priceEur = numberOrNull(item?.price);

  if (!priceEur || priceEur <= 0) return null;

  const series = (normalizedTitle.match(/\b207[AX]\b/) || [null])[0] || '207A';
  const packCountMatch = normalizedTitle.match(/\bPACK\s+DE\s+(\d+)\b/);
  const packCount = packCountMatch ? Number(packCountMatch[1]) : 1;

  const codes = dedupe((normalizedTitle.match(/\bW\d{4}[AX]\b/g) || []).map((x) => x.toUpperCase()));
  const primaryCode = codes.length === 1 ? codes[0] : null;

  const statusLabel = /\bCOMPATIB/.test(normalizedTitle)
    ? 'Compatible'
    : /\bORIGIN/.test(normalizedTitle)
      ? 'Original'
      : 'Original';
  const statusToken = statusLabel.toUpperCase();

  const colorInfo = extractColorInfo(normalizedTitle);
  const composition = buildComposition({ series, codes, packCount });
  const yieldsText = computeYieldsText({ series, colors: colorInfo.colors, packCount });
  const quantityText = packCount > 1 ? `Pack de ${packCount}` : 'Pack de 1';

  const xof = convertEurToBusinessXof(priceEur);
  const imageUrl = imageMatch?.[1] || null;

  const description = buildDescription({
    statusLabel,
    series,
    colorLabel: colorInfo.label,
    yieldsText,
    quantityText,
    composition,
    sourceUrl: url
  });

  const reference = buildReference({
    series,
    primaryCode,
    packCount,
    statusToken,
    colorToken: colorInfo.token
  });

  return {
    source_url: url,
    source_price_eur: Number(priceEur.toFixed(2)),
    name: 'CARTOUCHE DE TONER',
    reference,
    brand: 'HP',
    model: primaryCode || `${series}_${colorInfo.token}`.slice(0, 120),
    description,
    hardware_type: 'bureautique',
    purchase_price: xof.purchase,
    sale_price: xof.sale,
    quantity: 15,
    condition_state: 'neuf',
    source_country: 'FRANCE',
    estimated_delay: '10/15 J',
    notes: COMPATIBILITY_NOTES,
    image_url: imageUrl
  };
};

const ensureSupplier = async (connection) => {
  const targetName = 'Cartouche deToner';
  const [existing] = await connection.query('SELECT id FROM suppliers WHERE name = ? LIMIT 1', [targetName]);
  if (existing.length > 0) return existing[0].id;

  const [result] = await connection.query(
    `
      INSERT INTO suppliers
      (name, country, city, phone, email, supplier_type, platform, delivery_delay, reliability_level, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      targetName,
      'FRANCE',
      'PARIS',
      null,
      null,
      'site officiel',
      'site officiel',
      '10/15 J',
      'élevé',
      'Fournisseur créé automatiquement pour import cartouches.'
    ]
  );
  return result.insertId;
};

const ensureCategory = async (connection) => {
  const targetName = 'Cartouche Imprimatee';
  const [existing] = await connection.query('SELECT id FROM categories WHERE name = ? LIMIT 1', [targetName]);
  if (existing.length > 0) return existing[0].id;

  const [result] = await connection.query(
    `
      INSERT INTO categories (name, category_type, description)
      VALUES (?, ?, ?)
    `,
    [targetName, 'hardware', 'Catégorie ajoutée automatiquement pour cartouches toner']
  );
  return result.insertId;
};

const downloadProductImage = async ({ imageUrl, reference }) => {
  if (!imageUrl) return null;

  const uploadsDir = path.resolve(process.cwd(), 'uploads', 'scraped');
  await fs.mkdir(uploadsDir, { recursive: true });

  const parsed = new URL(imageUrl);
  const extFromPath = path.extname(parsed.pathname).toLowerCase();
  const ext = ['.jpg', '.jpeg', '.png', '.webp'].includes(extFromPath) ? extFromPath : '.jpg';

  const safeName = reference.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  const filename = `${safeName}${ext}`;
  const localPath = path.join(uploadsDir, filename);

  const binary = await fetchBinary(imageUrl);
  await fs.writeFile(localPath, binary);

  return `uploads/scraped/${filename}`;
};

const upsertHardwareItem = async ({ connection, item, categoryId, supplierId, localImagePath }) => {
  await connection.query(
    `
      INSERT INTO hardware (
        name, reference, brand, model, description, hardware_type, category_id, supplier_id,
        purchase_price, sale_price, quantity, condition_state, source_country, estimated_delay,
        notes, main_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        brand = VALUES(brand),
        model = VALUES(model),
        description = VALUES(description),
        hardware_type = VALUES(hardware_type),
        category_id = VALUES(category_id),
        supplier_id = VALUES(supplier_id),
        purchase_price = VALUES(purchase_price),
        sale_price = VALUES(sale_price),
        quantity = VALUES(quantity),
        condition_state = VALUES(condition_state),
        source_country = VALUES(source_country),
        estimated_delay = VALUES(estimated_delay),
        notes = VALUES(notes),
        main_image = VALUES(main_image),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      item.name,
      item.reference,
      item.brand,
      item.model,
      item.description,
      item.hardware_type,
      categoryId,
      supplierId,
      item.purchase_price,
      item.sale_price,
      item.quantity,
      item.condition_state,
      item.source_country,
      item.estimated_delay,
      item.notes,
      localImagePath
    ]
  );
};

const run = async () => {
  const { limit, queries } = parseCliArgs();
  console.log(`[scrape-cartouche-cfa] Démarrage | queries=${queries.join(', ')} | limit=${limit}`);

  const productUrlSet = new Set();

  for (const query of queries) {
    const searchUrl = `${SOURCE_BASE_URL}/recherche?controller=search&s=${encodeURIComponent(query)}`;
    try {
      const searchHtml = await fetchHtml(searchUrl);
      const links = extractProductUrlsFromSearchPage(searchHtml);
      const before = productUrlSet.size;
      links.forEach((url) => productUrlSet.add(url));
      console.log(
        `[scrape-cartouche-cfa] recherche "${query}" -> ${links.length} urls brutes, +${productUrlSet.size - before} uniques`
      );
    } catch (error) {
      console.warn(`[scrape-cartouche-cfa] recherche "${query}" échouée: ${error.message}`);
    }
    await delay(DELAY_MS);
  }

  const productUrls = Array.from(productUrlSet)
    .filter((url) => /cartouche|toner|w221|207/i.test(url))
    .slice(0, limit);

  console.log(`[scrape-cartouche-cfa] urls retenues: ${productUrls.length}`);

  const parsedItems = [];
  for (const url of productUrls) {
    try {
      const html = await fetchHtml(url);
      const item = parseProductPage({ url, html });
      if (!item) {
        console.warn(`[scrape-cartouche-cfa] ignoré (données incomplètes): ${url}`);
      } else {
        parsedItems.push(item);
        console.log(
          `[scrape-cartouche-cfa] + ${item.reference} | achat=${item.purchase_price} FCFA | vente=${item.sale_price} FCFA`
        );
      }
    } catch (error) {
      console.warn(`[scrape-cartouche-cfa] échec produit ${url}: ${error.message}`);
    }
    await delay(DELAY_MS);
  }

  const dedupByReference = new Map();
  parsedItems.forEach((item) => {
    if (!dedupByReference.has(item.reference)) {
      dedupByReference.set(item.reference, item);
    }
  });
  const finalItems = Array.from(dedupByReference.values());

  if (finalItems.length === 0) {
    console.log('[scrape-cartouche-cfa] Aucun produit valide à insérer.');
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const supplierId = await ensureSupplier(connection);
    const categoryId = await ensureCategory(connection);

    let insertedOrUpdated = 0;
    let imageDownloaded = 0;

    for (const item of finalItems) {
      let localImagePath = null;
      try {
        localImagePath = await downloadProductImage({ imageUrl: item.image_url, reference: item.reference });
        if (localImagePath) imageDownloaded += 1;
      } catch (error) {
        console.warn(`[scrape-cartouche-cfa] image non téléchargée (${item.reference}): ${error.message}`);
      }

      await upsertHardwareItem({ connection, item, categoryId, supplierId, localImagePath });
      insertedOrUpdated += 1;
    }

    await connection.commit();
    console.log(
      `[scrape-cartouche-cfa] Import terminé: ${insertedOrUpdated} upsert | images=${imageDownloaded} | supplier_id=${supplierId} | category_id=${categoryId}`
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

run()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('[scrape-cartouche-cfa][error]', error.message);
    await pool.end();
    process.exit(1);
  });

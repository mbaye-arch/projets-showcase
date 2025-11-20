import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pool from '../src/config/db.js';

const SOURCE_BASE_URL = 'https://www.cartouche-de-toner.fr';
const DEFAULT_QUERIES = ['207A', '207X', 'W2210A', 'W2211A', 'W2212A', 'W2213A'];
const DEFAULT_LIMIT = 50;
const DELAY_MS = 220;

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

const normalizeRefText = (value = '') =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();

const extractColorTokenFromTitle = (normalizedTitle) => {
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
    return colorOrder
      .filter((color) => qtyMap.has(color))
      .map((color) => `${qtyMap.get(color)}${color}`)
      .join('_');
  }

  const present = colorOrder.filter((color) =>
    color === 'NOIR' ? /\bNOIR(?:E|ES)?\b/.test(normalizedTitle) : new RegExp(`\\b${color}\\b`).test(normalizedTitle)
  );

  return present.length > 0 ? present.join('_') : null;
};

const buildReference = ({ title }) => {
  const normalizedTitle = normalizeRefText(title);

  const series = (normalizedTitle.match(/\b207[AX]\b/) || [null])[0] || '207A';
  const code = (normalizedTitle.match(/\bW\d{4}[AX]\b/) || [null])[0];
  const packMatch = normalizedTitle.match(/\bPACK\s+DE\s+(\d+)\b/);
  const pack = packMatch ? packMatch[1] : null;

  const status = /\bCOMPATIB/.test(normalizedTitle)
    ? 'COMPATIBLE'
    : /\bORIGIN/.test(normalizedTitle)
      ? 'ORIGINAL'
      : 'STANDARD';

  const colorToken = extractColorTokenFromTitle(normalizedTitle);

  const parts = ['HP', series];
  if (code) parts.push(code);
  if (pack) parts.push(`PACK_${pack}`);
  parts.push(status);
  if (colorToken) parts.push(colorToken);

  return parts.join('_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120);
};

const inferModel = (title) => {
  const codeMatch = title.match(/\b(W\d{4}A|[1-9]\d{2}[A-Z])\b/i);
  if (codeMatch) {
    return codeMatch[1].toUpperCase();
  }
  return title.slice(0, 120);
};

const parseProductPage = ({ url, html }) => {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const dataLayerMatch = html.match(/let\s+cdcDatalayer\s*=\s*(\{[\s\S]*?\});/i);

  const title = stripTags(titleMatch?.[1] || '').slice(0, 160);
  if (!title) return null;

  const dataLayer = dataLayerMatch ? safeJsonParse(dataLayerMatch[1]) : null;
  const item = dataLayer?.ecommerce?.items?.[0] || null;
  const priceEur = numberOrNull(item?.price);

  if (!priceEur || priceEur <= 0) return null;

  const salePrice = Number(priceEur.toFixed(2));
  const purchasePrice = Number((salePrice * 0.88).toFixed(2));
  const brand = (stripTags(item?.item_brand || '').toUpperCase() || 'HP').slice(0, 120);
  const model = inferModel(title);
  const descriptionText = stripTags(descriptionMatch?.[1] || '');
  const imageUrl = imageMatch?.[1] || null;

  return {
    source_url: url,
    source_price_eur: salePrice,
    name: 'CARTOUCHE DE TONER',
    reference: buildReference({ title }),
    brand,
    model,
    description: `${title}\n${descriptionText}\n${url}`.slice(0, 6000),
    hardware_type: 'bureautique',
    purchase_price: purchasePrice,
    sale_price: salePrice,
    quantity: 15,
    condition_state: 'neuf',
    source_country: 'FRANCE',
    estimated_delay: '10/15 J',
    notes: `Import scraping cartouche-de-toner.fr | Prix EUR: ${salePrice}`,
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
      'Créé automatiquement pour import scraping cartouches.'
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
  const filename = `${reference.toLowerCase()}${ext}`;
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
  console.log(`[scrape-cartouche-eur] Démarrage | queries=${queries.join(', ')} | limit=${limit}`);

  const productUrlSet = new Set();

  for (const query of queries) {
    const searchUrl = `${SOURCE_BASE_URL}/recherche?controller=search&s=${encodeURIComponent(query)}`;
    try {
      const searchHtml = await fetchHtml(searchUrl);
      const links = extractProductUrlsFromSearchPage(searchHtml);
      const before = productUrlSet.size;
      links.forEach((url) => productUrlSet.add(url));
      console.log(
        `[scrape-cartouche-eur] recherche "${query}" -> ${links.length} urls brutes, +${productUrlSet.size - before} uniques`
      );
    } catch (error) {
      console.warn(`[scrape-cartouche-eur] recherche "${query}" échouée: ${error.message}`);
    }
    await delay(DELAY_MS);
  }

  const productUrls = Array.from(productUrlSet)
    .filter((url) => /cartouche|toner|w221|207/i.test(url))
    .slice(0, limit);

  console.log(`[scrape-cartouche-eur] urls retenues: ${productUrls.length}`);

  const parsedItems = [];
  for (const url of productUrls) {
    try {
      const html = await fetchHtml(url);
      const item = parseProductPage({ url, html });
      if (!item) {
        console.warn(`[scrape-cartouche-eur] ignoré (données incomplètes): ${url}`);
      } else {
        parsedItems.push(item);
        console.log(`[scrape-cartouche-eur] + ${item.reference} | ${item.sale_price} EUR`);
      }
    } catch (error) {
      console.warn(`[scrape-cartouche-eur] échec produit ${url}: ${error.message}`);
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
    console.log('[scrape-cartouche-eur] Aucun produit valide à insérer.');
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
        console.warn(`[scrape-cartouche-eur] image non téléchargée (${item.reference}): ${error.message}`);
      }

      await upsertHardwareItem({ connection, item, categoryId, supplierId, localImagePath });
      insertedOrUpdated += 1;
    }

    await connection.commit();
    console.log(
      `[scrape-cartouche-eur] Import terminé: ${insertedOrUpdated} upsert | images=${imageDownloaded} | supplier_id=${supplierId} | category_id=${categoryId}`
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
    console.error('[scrape-cartouche-eur][error]', error.message);
    await pool.end();
    process.exit(1);
  });

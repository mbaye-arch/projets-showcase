import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { load as loadHtml } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const DEFAULT_LIMIT_PER_SEARCH = 10;
const DEFAULT_DUMMY_LIMIT = 80;

const BASE_SUPPLIERS = [
  {
    name: 'LDLC',
    country: 'France',
    city: 'Lyon',
    phone: '+33 4 27 46 60 00',
    email: 'contact@ldlc.com',
    supplier_type: 'distributeur IT',
    platform: 'site officiel',
    delivery_delay: '2 à 5 jours',
    reliability_level: 'élevé',
    notes: 'Source scraping e-commerce FR'
  },
  {
    name: 'Materiel.net',
    country: 'France',
    city: 'Nantes',
    phone: '+33 2 40 92 91 91',
    email: 'contact@materiel.net',
    supplier_type: 'distributeur IT',
    platform: 'site officiel',
    delivery_delay: '2 à 5 jours',
    reliability_level: 'élevé',
    notes: 'Source scraping e-commerce FR'
  },
  {
    name: 'Rue du Commerce',
    country: 'France',
    city: 'Paris',
    phone: '+33 8 92 46 56 66',
    email: 'contact@rueducommerce.fr',
    supplier_type: 'marketplace',
    platform: 'site officiel',
    delivery_delay: '2 à 7 jours',
    reliability_level: 'moyen',
    notes: 'Source scraping e-commerce FR'
  },
  {
    name: 'Amazon',
    country: 'France',
    city: 'Paris',
    phone: '+33 8 00 94 77 15',
    email: 'service-client@amazon.fr',
    supplier_type: 'marketplace',
    platform: 'Amazon',
    delivery_delay: '1 à 4 jours',
    reliability_level: 'élevé',
    notes: 'Fournisseur multi-catégories'
  },
  {
    name: 'Back Market',
    country: 'France',
    city: 'Paris',
    phone: '+33 1 76 36 04 13',
    email: 'hello@backmarket.com',
    supplier_type: 'reconditionné',
    platform: 'Back Market',
    delivery_delay: '2 à 6 jours',
    reliability_level: 'moyen',
    notes: 'Spécialiste reconditionné'
  },
  {
    name: 'Fnac',
    country: 'France',
    city: 'Paris',
    phone: '+33 9 69 32 43 34',
    email: 'service-client@fnac.com',
    supplier_type: 'retail',
    platform: 'Fnac',
    delivery_delay: '2 à 6 jours',
    reliability_level: 'élevé',
    notes: 'Retail généraliste'
  },
  {
    name: 'Darty',
    country: 'France',
    city: 'Bondy',
    phone: '+33 9 78 97 09 70',
    email: 'service-client@darty.com',
    supplier_type: 'retail',
    platform: 'Darty',
    delivery_delay: '2 à 6 jours',
    reliability_level: 'élevé',
    notes: 'Retail électroménager/IT'
  },
  {
    name: 'Alibaba',
    country: 'Chine',
    city: 'Hangzhou',
    phone: '+86 571 8502 2088',
    email: 'service@alibaba.com',
    supplier_type: 'grossiste',
    platform: 'Alibaba',
    delivery_delay: '10 à 25 jours',
    reliability_level: 'variable',
    notes: 'Marketplace B2B international'
  },
  {
    name: 'Cdiscount',
    country: 'France',
    city: 'Bordeaux',
    phone: '+33 8 92 70 02 22',
    email: 'serviceclient@cdiscount.com',
    supplier_type: 'marketplace',
    platform: 'Cdiscount',
    delivery_delay: '2 à 7 jours',
    reliability_level: 'moyen',
    notes: 'Marketplace grand public'
  },
  {
    name: 'Fournisseur local Dakar',
    country: 'Sénégal',
    city: 'Dakar',
    phone: '+221 33 000 00 00',
    email: 'contact@local-tech.sn',
    supplier_type: 'fournisseur local',
    platform: 'fournisseur local',
    delivery_delay: '1 à 3 jours',
    reliability_level: 'élevé',
    notes: 'Fournisseur de proximité SenTechCare'
  }
];

const HARDWARE_SEARCHES = [
  { query: 'ordinateur portable', category: 'ordinateurs', hardwareType: 'informatique' },
  { query: 'ecran', category: 'écrans', hardwareType: 'multimédia' },
  { query: 'imprimante', category: 'imprimantes', hardwareType: 'bureautique' },
  { query: 'routeur', category: 'routeurs', hardwareType: 'réseau' },
  { query: 'répéteur wifi', category: 'répéteurs WiFi', hardwareType: 'réseau' },
  { query: 'camera surveillance', category: 'caméras', hardwareType: 'sécurité' },
  { query: 'television', category: 'télévisions', hardwareType: 'multimédia' },
  { query: 'console de jeux', category: 'consoles de jeux', hardwareType: 'gaming' },
  { query: 'serveur', category: 'serveurs', hardwareType: 'informatique' },
  { query: 'accessoire informatique', category: 'accessoires', hardwareType: 'autre' }
];

const SOFTWARE_SEARCHES = [
  {
    query: 'antivirus',
    category: 'logiciels de sécurité',
    softwareType: 'logiciel de sécurité',
    usage: 'Protection endpoint et cybersécurité',
    keywords: ['antivirus', 'security', 'bitdefender', 'eset', 'g data']
  },
  {
    query: 'office 365',
    category: 'logiciels de gestion',
    softwareType: 'logiciel de gestion',
    usage: 'Bureautique collaborative',
    keywords: ['office', 'microsoft 365', 'business standard', 'famille']
  },
  {
    query: 'windows 11',
    category: 'logiciels internes',
    softwareType: 'logiciel interne',
    usage: 'Système d\'exploitation postes de travail',
    keywords: ['microsoft windows'],
    matchMode: 'name'
  },
  {
    query: 'logiciel gestion',
    category: 'logiciels de gestion',
    softwareType: 'logiciel de gestion',
    usage: 'Gestion d\'activité et productivité',
    keywords: ['office', 'microsoft', 'business', 'gestion']
  },
  {
    query: 'adobe',
    category: 'logiciels éducatifs',
    softwareType: 'logiciel éducatif',
    usage: 'Création multimédia et design',
    keywords: ['adobe', 'acrobat', 'creative cloud', 'lightroom', 'premiere']
  },
  {
    query: 'utilitaire',
    category: 'logiciels internes',
    softwareType: 'utilitaire',
    usage: 'Utilitaires système',
    keywords: ['backup', 'zip', 'driver', 'nero', 'ashampoo', 'pc check'],
    matchMode: 'name'
  }
];

const SOFTWARE_NAME_BLOCKLIST = [
  /\bpc11\b/i,
  /\bmontage pc\b/i,
  /\bordinateur\b/i,
  /\bportable\b/i,
  /\bboitier\b/i,
  /\bstation d['’ ]accueil\b/i,
  /\brouteur\b/i,
  /\bimprimante\b/i,
  /\becran\b/i,
  /\bserveur\b/i
];

const HARDWARE_SOURCES = [
  {
    name: 'LDLC',
    code: 'LDLC',
    baseUrl: 'https://www.ldlc.com',
    buildUrl: (query) => `https://www.ldlc.com/recherche/${encodeURIComponent(query)}/`,
    parser: 'ldlc-like'
  },
  {
    name: 'Materiel.net',
    code: 'MAT',
    baseUrl: 'https://www.materiel.net',
    buildUrl: (query) => `https://www.materiel.net/recherche/${encodeURIComponent(query)}/`,
    parser: 'materiel'
  },
  {
    name: 'Rue du Commerce',
    code: 'RDC',
    baseUrl: 'https://www.rueducommerce.fr',
    buildUrl: (query) => `https://www.rueducommerce.fr/recherche/${encodeURIComponent(query)}`,
    parser: 'ldlc-like'
  }
];

const DUMMY_SUPPLIER_POOL = ['Amazon', 'Fnac', 'Darty', 'Back Market', 'Alibaba', 'Cdiscount'];

const DUMMY_CATEGORY_MAP = {
  laptops: { category: 'ordinateurs', hardwareType: 'informatique' },
  smartphones: { category: 'multimédia', hardwareType: 'multimédia' },
  tablets: { category: 'ordinateurs', hardwareType: 'informatique' },
  'mobile-accessories': { category: 'accessoires', hardwareType: 'autre' }
};

const cleanText = (value = '') => value.replace(/\s+/g, ' ').trim();

const slugify = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const stableIntFromText = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const parseLocalePrice = (raw) => {
  if (!raw) return null;

  let value = String(raw).replace(/\u00a0/g, ' ').trim();
  value = value.replace(/[^\d,.-]/g, '');
  if (!value) return null;

  const commaCount = (value.match(/,/g) || []).length;
  const dotCount = (value.match(/\./g) || []).length;

  if (commaCount && dotCount) {
    if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
      value = value.replace(/\./g, '').replace(',', '.');
    } else {
      value = value.replace(/,/g, '');
    }
  } else if (commaCount) {
    value = value.replace(',', '.');
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const extractEuroPriceFromNode = ($, node) => {
  if (!node || !node.length) return null;

  const clone = node.clone();
  const centsRaw = cleanText(clone.find('sup').first().text());
  clone.find('sup').remove();

  let wholeRaw = cleanText(clone.text());

  if (centsRaw) {
    const cents = centsRaw.replace(/\D/g, '').slice(0, 2).padEnd(2, '0');
    wholeRaw = `${wholeRaw},${cents}`;
  }

  return parseLocalePrice(wholeRaw);
};

const toAbsoluteUrl = (href, baseUrl) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
};

const detectCondition = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('reconditionn') || text.includes('refurb')) return 'reconditionné';
  if (text.includes('occasion') || text.includes('used')) return 'occasion';
  return 'neuf';
};

const detectBrand = (title) => {
  const first = cleanText(title).split(' ')[0] || '';
  return first.slice(0, 120) || 'Divers';
};

const detectModel = (title, brand) => {
  const normalized = cleanText(title);
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const model = normalized.replace(new RegExp(`^${escapedBrand}\\s*`, 'i'), '');
  return cleanText(model).slice(0, 120) || normalized.slice(0, 120);
};

const detectSoftwareVendor = (name) => {
  const normalized = cleanText(name);
  if (!normalized) return 'LDLC';

  if (/^g\\s+data/i.test(normalized)) return 'G DATA';
  if (/^microsoft/i.test(normalized)) return 'Microsoft';
  if (/^adobe/i.test(normalized)) return 'Adobe';
  if (/^bitdefender/i.test(normalized)) return 'Bitdefender';
  if (/^eset/i.test(normalized)) return 'ESET';
  if (/^nero/i.test(normalized)) return 'Nero';
  if (/^ashampoo/i.test(normalized)) return 'Ashampoo';

  const token = normalized.split(' ')[0];
  return token.slice(0, 160);
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'application/json,text/plain,*/*'
    },
    signal: AbortSignal.timeout(25000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} sur ${url}`);
  }

  return response.json();
};

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} sur ${url}`);
  }

  return response.text();
};

const parseLdlcLike = ({ html, source, searchSpec, limit }) => {
  const $ = loadHtml(html);
  const cards = $('li.pdt-item').toArray();
  const items = [];

  for (const element of cards) {
    if (items.length >= limit) break;

    const card = $(element);
    const title = cleanText(card.find('h3.title-3').first().text());
    if (!title) continue;

    const description = cleanText(card.find('p.desc, a.listing-product__desc').first().text());
    const href =
      card.find('h3.title-3').closest('a').attr('href') ||
      card.find('a[href]').first().attr('href') ||
      null;

    const image = card.find('img').first().attr('src') || null;

    const priceNode =
      card.find('.basket .price .price').first().length > 0
        ? card.find('.basket .price .price').first()
        : card.find('.price .price').first();

    const eurPrice = extractEuroPriceFromNode($, priceNode);
    if (!eurPrice) continue;

    const externalId = cleanText(
      card.attr('data-id') || card.attr('data-offer-id') || card.attr('id') || slugify(title)
    );

    items.push({
      sourceName: source.name,
      sourceCode: source.code,
      categoryName: searchSpec.category,
      hardwareType: searchSpec.hardwareType,
      name: title,
      description,
      link: toAbsoluteUrl(href, source.baseUrl),
      image: image || null,
      externalId,
      eurPrice,
      condition: detectCondition(title, description)
    });
  }

  return items;
};

const parseMateriel = ({ html, source, searchSpec, limit }) => {
  const $ = loadHtml(html);
  const cards = $('li.c-products-list__item').toArray();
  const items = [];

  for (const element of cards) {
    if (items.length >= limit) break;

    const card = $(element);
    const title = cleanText(card.find('h2.c-product__title').first().text());
    if (!title) continue;

    const description = cleanText(card.find('p.c-product__description').first().text());
    const href = card.find('a.c-product__link').first().attr('href') || null;
    const image = card.find('.c-product__thumb img').first().attr('src') || null;
    const eurPrice = extractEuroPriceFromNode($, card.find('.o-product__price').first());
    if (!eurPrice) continue;

    const externalId = cleanText(card.attr('data-id') || card.attr('data-offer-id') || slugify(title));

    items.push({
      sourceName: source.name,
      sourceCode: source.code,
      categoryName: searchSpec.category,
      hardwareType: searchSpec.hardwareType,
      name: title,
      description,
      link: toAbsoluteUrl(href, source.baseUrl),
      image: image || null,
      externalId,
      eurPrice,
      condition: detectCondition(title, description)
    });
  }

  return items;
};

const scrapeHardwareFromSource = async ({ source, searchSpec, limit }) => {
  const url = source.buildUrl(searchSpec.query);
  const html = await fetchHtml(url);

  if (source.parser === 'materiel') {
    return parseMateriel({ html, source, searchSpec, limit });
  }

  return parseLdlcLike({ html, source, searchSpec, limit });
};

const scrapeSoftwareFromLdlc = async ({ searchSpec, limit }) => {
  const source = HARDWARE_SOURCES[0];
  const url = source.buildUrl(searchSpec.query);
  const html = await fetchHtml(url);
  const raw = parseLdlcLike({
    html,
    source,
    searchSpec: {
      category: searchSpec.category,
      hardwareType: 'autre'
    },
    limit
  });

  const keywords = (searchSpec.keywords || []).map((keyword) => keyword.toLowerCase());
  const matchMode = searchSpec.matchMode || 'all';

  return raw
    .filter((item) => {
      if (SOFTWARE_NAME_BLOCKLIST.some((regex) => regex.test(item.name))) {
        return false;
      }

      if (!keywords.length) return true;
      const haystack =
        matchMode === 'name'
          ? item.name.toLowerCase()
          : `${item.name} ${item.description}`.toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    })
    .map((item) => ({
      name: item.name,
      softwareType: searchSpec.softwareType,
      categoryName: searchSpec.category,
      description: item.description || `Logiciel issu de la recherche ${searchSpec.query}`,
      usagePurpose: searchSpec.usage,
      hasLicense: 1,
      vendorName: detectSoftwareVendor(item.name),
      compatibility: 'Windows / macOS',
      notes: `Source ${item.sourceName} - ${item.link || 'n/a'}`,
      eurPrice: item.eurPrice
    }));
};

const scrapeDummyHardware = async ({ limit, usdToXof }) => {
  const payload = await fetchJson('https://dummyjson.com/products?limit=194');
  const products = Array.isArray(payload?.products) ? payload.products : [];

  const items = [];

  for (const product of products) {
    if (items.length >= limit) break;

    const mapping = DUMMY_CATEGORY_MAP[product.category];
    if (!mapping) continue;

    const supplierName = DUMMY_SUPPLIER_POOL[Number(product.id) % DUMMY_SUPPLIER_POOL.length];
    const usdPrice = Number(product.price || 0);
    if (!usdPrice) continue;

    const xofPrice = Math.round(usdPrice * usdToXof);

    items.push({
      sourceName: 'DummyJSON API',
      sourceCode: 'DMY',
      categoryName: mapping.category,
      hardwareType: mapping.hardwareType,
      name: cleanText(product.title || ''),
      description: cleanText(product.description || ''),
      link: null,
      image: product.thumbnail || null,
      externalId: `DJ-${product.id}`,
      eurPrice: xofPrice / 655.957,
      usdPrice,
      salePriceXof: xofPrice,
      supplierName,
      condition: 'neuf'
    });
  }

  return items;
};

const getFxRates = async () => {
  try {
    const data = await fetchJson('https://open.er-api.com/v6/latest/EUR');
    const eurToXof = Number(data?.rates?.XOF || 655.957);
    const eurToUsd = Number(data?.rates?.USD || 1.08);
    const usdToXof = eurToXof / eurToUsd;

    if (!eurToXof || !usdToXof) throw new Error('Taux invalides');

    return {
      eurToXof,
      usdToXof,
      source: 'open.er-api.com'
    };
  } catch (error) {
    console.warn('[scrape-seed] Impossible de récupérer les taux live. Fallback utilisé.', error.message);
    return {
      eurToXof: 655.957,
      usdToXof: 605,
      source: 'fallback-fixed'
    };
  }
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const getNumericArg = (name, fallback) => {
    const raw = args.find((arg) => arg.startsWith(`${name}=`));
    if (!raw) return fallback;
    const parsed = Number(raw.split('=')[1]);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
  };

  return {
    dryRun: args.includes('--dry-run'),
    limitPerSearch: getNumericArg('--limit', DEFAULT_LIMIT_PER_SEARCH),
    dummyLimit: getNumericArg('--dummy-limit', DEFAULT_DUMMY_LIMIT)
  };
};

const buildHardwareReference = (item) => {
  const raw = `${item.sourceCode}-${item.externalId || slugify(item.name)}`;
  return `SC-${slugify(raw).toUpperCase()}`.slice(0, 120);
};

const ensureCategoryEntries = (hardwareItems, softwareItems) => {
  const entries = new Map();

  const setCategory = (name, type, description) => {
    if (!name) return;
    if (!entries.has(name)) {
      entries.set(name, {
        name,
        categoryType: type,
        description
      });
    }
  };

  hardwareItems.forEach((item) => {
    setCategory(item.categoryName, 'hardware', `Catégorie importée automatiquement (${item.hardwareType})`);
  });

  softwareItems.forEach((item) => {
    setCategory(item.categoryName, 'software', `Catégorie logiciel importée automatiquement`);
  });

  return Array.from(entries.values());
};

const upsertSuppliers = async (connection, suppliers) => {
  if (!suppliers.length) return;

  const values = suppliers.map((supplier) => [
    supplier.name,
    supplier.country,
    supplier.city,
    supplier.phone,
    supplier.email,
    supplier.supplier_type,
    supplier.platform,
    supplier.delivery_delay,
    supplier.reliability_level,
    supplier.notes
  ]);

  await connection.query(
    `
      INSERT INTO suppliers (
        name, country, city, phone, email,
        supplier_type, platform, delivery_delay, reliability_level, notes
      ) VALUES ?
      ON DUPLICATE KEY UPDATE
        country = VALUES(country),
        city = VALUES(city),
        phone = VALUES(phone),
        email = VALUES(email),
        supplier_type = VALUES(supplier_type),
        platform = VALUES(platform),
        delivery_delay = VALUES(delivery_delay),
        reliability_level = VALUES(reliability_level),
        notes = VALUES(notes),
        updated_at = CURRENT_TIMESTAMP
    `,
    [values]
  );
};

const upsertCategories = async (connection, categories) => {
  if (!categories.length) return;

  const values = categories.map((category) => [category.name, category.categoryType, category.description]);

  await connection.query(
    `
      INSERT INTO categories (name, category_type, description)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        category_type = VALUES(category_type),
        description = VALUES(description),
        updated_at = CURRENT_TIMESTAMP
    `,
    [values]
  );
};

const toMapByName = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    map.set(row.name, row.id);
  });
  return map;
};

const applyHardware = async ({ connection, hardwareItems, supplierIdByName, categoryIdByName, fx }) => {
  let insertedOrUpdated = 0;

  for (const item of hardwareItems) {
    const supplierName = item.supplierName || item.sourceName;
    const supplierId = supplierIdByName.get(supplierName) ?? null;
    const categoryId = categoryIdByName.get(item.categoryName) ?? null;

    const reference = buildHardwareReference(item);
    const salePrice = item.salePriceXof || Math.round(item.eurPrice * fx.eurToXof);
    const purchasePrice = Math.round(salePrice * 0.84);

    const seed = stableIntFromText(`${item.name}-${item.externalId}`);
    const quantity = 2 + (seed % 28);

    const brand = detectBrand(item.name);
    const model = detectModel(item.name, brand);

    const notes = [
      item.link ? `Source: ${item.link}` : null,
      `Import auto scraping (${item.sourceName})`,
      `Taux conversion EUR->XOF: ${fx.eurToXof.toFixed(3)}`
    ]
      .filter(Boolean)
      .join(' | ');

    await connection.query(
      `
        INSERT INTO hardware (
          name, reference, brand, model, description,
          hardware_type, category_id, supplier_id,
          purchase_price, sale_price, quantity,
          condition_state, source_country, estimated_delay,
          notes, main_image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        item.name.slice(0, 160),
        reference,
        brand,
        model,
        item.description || null,
        item.hardwareType,
        categoryId,
        supplierId,
        purchasePrice,
        salePrice,
        quantity,
        item.condition || 'neuf',
        'France',
        '2 à 7 jours',
        notes,
        item.image || null
      ]
    );

    insertedOrUpdated += 1;
  }

  return insertedOrUpdated;
};

const applySoftware = async ({ connection, softwareItems, categoryIdByName, fx }) => {
  let insertedOrUpdated = 0;

  for (const item of softwareItems) {
    const categoryId = categoryIdByName.get(item.categoryName) ?? null;
    const priceXof = Math.round(item.eurPrice * fx.eurToXof);

    await connection.query(
      `
        INSERT INTO software (
          name, software_type, category_id, description,
          usage_purpose, has_license, price, vendor_name,
          compatibility, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          software_type = VALUES(software_type),
          category_id = VALUES(category_id),
          description = VALUES(description),
          usage_purpose = VALUES(usage_purpose),
          has_license = VALUES(has_license),
          price = VALUES(price),
          vendor_name = VALUES(vendor_name),
          compatibility = VALUES(compatibility),
          notes = VALUES(notes),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        item.name.slice(0, 160),
        item.softwareType,
        categoryId,
        item.description || null,
        item.usagePurpose,
        item.hasLicense,
        priceXof,
        item.vendorName,
        item.compatibility,
        `${item.notes} | Prix converti en FCFA (EUR->XOF ${fx.eurToXof.toFixed(3)})`
      ]
    );

    insertedOrUpdated += 1;
  }

  return insertedOrUpdated;
};

const buildDbConfig = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sentechcare_internal_manager'
});

const main = async () => {
  const { dryRun, limitPerSearch, dummyLimit } = parseArgs();
  const startedAt = new Date();

  console.log('[scrape-seed] Démarrage import scraping...');
  console.log(`[scrape-seed] limit par recherche: ${limitPerSearch}, dummy-limit: ${dummyLimit}`);

  const fx = await getFxRates();
  console.log(
    `[scrape-seed] Taux ${fx.source}: EUR->XOF=${fx.eurToXof.toFixed(3)} | USD->XOF=${fx.usdToXof.toFixed(3)}`
  );

  const hardwareCollected = [];

  for (const source of HARDWARE_SOURCES) {
    for (const searchSpec of HARDWARE_SEARCHES) {
      try {
        const items = await scrapeHardwareFromSource({
          source,
          searchSpec,
          limit: limitPerSearch
        });
        hardwareCollected.push(...items);
        console.log(
          `[scrape-seed] ${source.name} | "${searchSpec.query}" -> ${items.length} matériels récupérés`
        );
      } catch (error) {
        console.warn(
          `[scrape-seed] ${source.name} | "${searchSpec.query}" échoué: ${error.message}`
        );
      }
    }
  }

  let dummyItems = [];
  try {
    dummyItems = await scrapeDummyHardware({ limit: dummyLimit, usdToXof: fx.usdToXof });
    console.log(`[scrape-seed] DummyJSON -> ${dummyItems.length} matériels récupérés`);
  } catch (error) {
    console.warn(`[scrape-seed] DummyJSON échoué: ${error.message}`);
  }

  const hardwareByKey = new Map();
  [...hardwareCollected, ...dummyItems].forEach((item) => {
    const key = `${item.sourceCode}:${item.externalId || slugify(item.name)}`;
    if (!hardwareByKey.has(key)) {
      hardwareByKey.set(key, item);
    }
  });
  const hardwareItems = Array.from(hardwareByKey.values());

  const softwareCollected = [];
  for (const searchSpec of SOFTWARE_SEARCHES) {
    try {
      const items = await scrapeSoftwareFromLdlc({ searchSpec, limit: limitPerSearch });
      softwareCollected.push(...items);
      console.log(
        `[scrape-seed] Logiciels LDLC | "${searchSpec.query}" -> ${items.length} logiciels récupérés`
      );
    } catch (error) {
      console.warn(`[scrape-seed] Logiciels "${searchSpec.query}" échoué: ${error.message}`);
    }
  }

  const softwareByName = new Map();
  softwareCollected.forEach((item) => {
    const key = slugify(item.name);
    if (!softwareByName.has(key)) {
      softwareByName.set(key, item);
    }
  });
  const softwareItems = Array.from(softwareByName.values());

  const suppliers = [...BASE_SUPPLIERS];
  const supplierNames = new Set(suppliers.map((supplier) => supplier.name));
  hardwareItems.forEach((item) => {
    const supplierName = item.supplierName || item.sourceName;
    if (!supplierNames.has(supplierName)) {
      suppliers.push({
        name: supplierName,
        country: 'France',
        city: 'Paris',
        phone: null,
        email: null,
        supplier_type: 'autre',
        platform: 'autre',
        delivery_delay: '3 à 8 jours',
        reliability_level: 'moyen',
        notes: 'Ajout automatique import scraping'
      });
      supplierNames.add(supplierName);
    }
  });

  const categories = ensureCategoryEntries(hardwareItems, softwareItems);

  const previewPath = path.resolve(__dirname, '../sql/seed_scraped_preview.json');
  await writeFile(
    previewPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        fx,
        totals: {
          suppliers: suppliers.length,
          categories: categories.length,
          hardware: hardwareItems.length,
          software: softwareItems.length
        },
        sampleHardware: hardwareItems.slice(0, 10),
        sampleSoftware: softwareItems.slice(0, 10)
      },
      null,
      2
    ),
    'utf8'
  );

  if (dryRun) {
    console.log('[scrape-seed] Mode --dry-run actif: aucune écriture DB.');
    console.log(`[scrape-seed] Aperçu généré: ${previewPath}`);
    console.log(
      `[scrape-seed] Résumé -> suppliers=${suppliers.length} | categories=${categories.length} | hardware=${hardwareItems.length} | software=${softwareItems.length}`
    );
    return;
  }

  const dbConfig = buildDbConfig();
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    await upsertSuppliers(connection, suppliers);
    await upsertCategories(connection, categories);

    const [supplierRows] = await connection.query('SELECT id, name FROM suppliers');
    const [categoryRows] = await connection.query('SELECT id, name FROM categories');

    const supplierIdByName = toMapByName(supplierRows);
    const categoryIdByName = toMapByName(categoryRows);

    const hardwareCount = await applyHardware({
      connection,
      hardwareItems,
      supplierIdByName,
      categoryIdByName,
      fx
    });

    const softwareCount = await applySoftware({
      connection,
      softwareItems,
      categoryIdByName,
      fx
    });

    await connection.commit();

    const durationSec = ((Date.now() - startedAt.getTime()) / 1000).toFixed(1);
    console.log('[scrape-seed] Import terminé avec succès.');
    console.log(
      `[scrape-seed] Résumé -> suppliers=${suppliers.length} | categories=${categories.length} | hardware upsert=${hardwareCount} | software upsert=${softwareCount}`
    );
    console.log(`[scrape-seed] Durée: ${durationSec}s`);
    console.log(`[scrape-seed] Aperçu JSON: ${previewPath}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error('[scrape-seed][error]', error.message);
  process.exit(1);
});

import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { computeStockStatus, computeStockValue } from '../utils/stockStatus.util.js';
import { generateUniqueInventoryNumber, ensureInventoryNumberIsAvailable } from './inventoryNumber.service.js';
import { getParametre } from './parametre.service.js';
import { buildQrCodeValue, generateQrCodeDataUrl } from '../utils/qrcode.util.js';
import { generateBarcodeSvg } from '../utils/barcode.util.js';
import { buildLabelHtml } from '../utils/labelTemplate.util.js';
import { htmlToPdfBuffer } from '../utils/pdf.util.js';

function mapStock(stock) {
  return {
    ...stock,
    prixAchat: Number(stock.prixAchat || 0),
    valeurStock: computeStockValue(stock.quantiteActuelle, stock.prixAchat),
    statutStock: computeStockStatus(stock.quantiteActuelle, stock.stockMinimum)
  };
}

async function buildQrValue(tx, inventoryNumber) {
  const strategy = await getParametre('QR_CODE_STRATEGY', tx);
  const baseUrl = await getParametre('QR_CODE_BASE_URL', tx);

  return buildQrCodeValue({
    strategy,
    inventoryNumber,
    baseUrl
  });
}

function getAutoPrefixFromMateriel(materiel) {
  if (materiel?.categorie) {
    return materiel.categorie.slice(0, 3).toUpperCase();
  }

  if (materiel?.nom) {
    return materiel.nom.slice(0, 3).toUpperCase();
  }

  return undefined;
}

export async function listStocks() {
  const rows = await prisma.stock.findMany({
    include: { materiel: true },
    orderBy: { createdAt: 'desc' }
  });

  return rows.map(mapStock);
}

export async function getStockById(id) {
  const row = await prisma.stock.findUnique({
    where: { id },
    include: { materiel: true }
  });

  if (!row) {
    throw new HttpError(404, 'Stock introuvable');
  }

  return mapStock(row);
}

export async function getStockByMaterielId(materielId) {
  const row = await prisma.stock.findUnique({
    where: { materielId },
    include: { materiel: true }
  });

  if (!row) {
    throw new HttpError(404, 'Stock introuvable pour ce matériel');
  }

  return mapStock(row);
}

export async function createStock(payload) {
  return prisma.$transaction(async (tx) => {
    const materiel = await tx.materiel.findUnique({ where: { id: payload.materielId } });

    if (!materiel) {
      throw new HttpError(404, 'Matériel introuvable');
    }

    const existingStock = await tx.stock.findUnique({ where: { materielId: payload.materielId } });
    if (existingStock) {
      throw new HttpError(409, 'Un stock existe déjà pour ce matériel');
    }

    let numeroInventaire = payload.numeroInventaire;
    if (numeroInventaire) {
      await ensureInventoryNumberIsAvailable(tx, numeroInventaire);
    } else {
      numeroInventaire = await generateUniqueInventoryNumber(tx, {
        prefixOverride: getAutoPrefixFromMateriel(materiel)
      });
    }

    const qrCodeValeur = payload.qrCodeValeur || (await buildQrValue(tx, numeroInventaire));
    const codeBarresValeur = payload.codeBarresValeur || numeroInventaire;

    const created = await tx.stock.create({
      data: {
        ...payload,
        numeroInventaire,
        codeBarresValeur,
        qrCodeValeur,
        prixAchat: payload.prixAchat,
        datePremiereEntree: payload.quantiteActuelle > 0 ? payload.datePremiereEntree || new Date() : null,
        dateDerniereEntree: payload.quantiteActuelle > 0 ? payload.dateDerniereEntree || new Date() : null
      },
      include: { materiel: true }
    });

    return mapStock(created);
  });
}

export async function updateStock(id, payload) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stock.findUnique({ where: { id }, include: { materiel: true } });

    if (!existing) {
      throw new HttpError(404, 'Stock introuvable');
    }

    if (payload.numeroInventaire && payload.numeroInventaire !== existing.numeroInventaire) {
      await ensureInventoryNumberIsAvailable(tx, payload.numeroInventaire, id);
    }

    let qrCodeValeur = payload.qrCodeValeur;
    if (!qrCodeValeur && payload.numeroInventaire && payload.numeroInventaire !== existing.numeroInventaire) {
      qrCodeValeur = await buildQrValue(tx, payload.numeroInventaire);
    }

    const updated = await tx.stock.update({
      where: { id },
      data: {
        ...payload,
        qrCodeValeur: qrCodeValeur ?? payload.qrCodeValeur,
        codeBarresValeur: payload.codeBarresValeur || payload.numeroInventaire || existing.codeBarresValeur
      },
      include: { materiel: true }
    });

    return mapStock(updated);
  });
}

export async function generateInventoryNumberForStock(stockId, { prefix, manualValue } = {}) {
  return prisma.$transaction(async (tx) => {
    const stock = await tx.stock.findUnique({ where: { id: stockId }, include: { materiel: true } });

    if (!stock) {
      throw new HttpError(404, 'Stock introuvable');
    }

    let numeroInventaire = manualValue;

    if (numeroInventaire) {
      await ensureInventoryNumberIsAvailable(tx, numeroInventaire, stockId);
    } else {
      numeroInventaire = await generateUniqueInventoryNumber(tx, {
        prefixOverride: prefix || getAutoPrefixFromMateriel(stock.materiel)
      });
    }

    const qrCodeValeur = await buildQrValue(tx, numeroInventaire);

    const updated = await tx.stock.update({
      where: { id: stockId },
      data: {
        numeroInventaire,
        codeBarresValeur: numeroInventaire,
        qrCodeValeur
      },
      include: { materiel: true }
    });

    return mapStock(updated);
  });
}

export async function generateBarcodeForStock(stockId) {
  const stock = await getStockById(stockId);
  const barcodeValue = stock.codeBarresValeur || stock.numeroInventaire;
  const svg = generateBarcodeSvg(barcodeValue);

  return {
    stockId,
    value: barcodeValue,
    svg
  };
}

export async function generateQrCodeForStock(stockId) {
  const stock = await getStockById(stockId);
  const qrValue = stock.qrCodeValeur || stock.numeroInventaire;
  const dataUrl = await generateQrCodeDataUrl(qrValue);

  return {
    stockId,
    value: qrValue,
    dataUrl
  };
}

export async function getLabelPreview(stockId, { format, content }) {
  const stock = await getStockById(stockId);
  const barcodeSvg = generateBarcodeSvg(stock.codeBarresValeur || stock.numeroInventaire);
  const qrCodeDataUrl = await generateQrCodeDataUrl(stock.qrCodeValeur || stock.numeroInventaire);

  const html = buildLabelHtml({
    materiel: stock.materiel,
    stock,
    barcodeSvg,
    qrCodeDataUrl,
    format,
    content
  });

  return {
    stock,
    format,
    content,
    barcodeSvg,
    qrCodeDataUrl,
    html
  };
}

export async function getLabelPdf(stockId, { format, content }) {
  const preview = await getLabelPreview(stockId, { format, content });
  const pdf = await htmlToPdfBuffer(preview.html, format);

  return {
    ...preview,
    pdf
  };
}

import dayjs from 'dayjs';
import { HttpError } from '../utils/httpError.js';
import { getParametre } from './parametre.service.js';

function formatInventoryNumber(format, { prefix, year, counter, padding }) {
  const counterString = String(counter).padStart(padding, '0');

  return format
    .replaceAll('{prefix}', prefix)
    .replaceAll('{year}', String(year))
    .replaceAll('{counter}', counterString);
}

async function reserveCounter(tx, prefix, anneeRef) {
  const row = await tx.compteurInventaire.upsert({
    where: {
      prefix_annee: {
        prefix,
        anneeRef
      }
    },
    update: {
      compteur: { increment: 1 }
    },
    create: {
      prefix,
      anneeRef,
      compteur: 1
    }
  });

  return row.compteur;
}

export async function generateUniqueInventoryNumber(tx, { prefixOverride } = {}) {
  const format = await getParametre('INVENTORY_FORMAT', tx);
  const defaultPrefix = await getParametre('INVENTORY_PREFIX_DEFAULT', tx);
  const padding = Number(await getParametre('INVENTORY_COUNTER_PADDING', tx)) || 4;
  const mode = await getParametre('INVENTORY_COUNTER_MODE', tx);

  const year = dayjs().year();
  const prefix = (prefixOverride || defaultPrefix || 'MAT').toUpperCase();
  const anneeRef = mode === 'GLOBAL' ? 0 : year;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const counter = await reserveCounter(tx, prefix, anneeRef);
    const candidate = formatInventoryNumber(format, { prefix, year, counter, padding });

    const existing = await tx.stock.findUnique({
      where: { numeroInventaire: candidate }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new HttpError(500, 'Impossible de générer un numéro inventaire unique');
}

export async function ensureInventoryNumberIsAvailable(tx, numeroInventaire, currentStockId = null) {
  const existing = await tx.stock.findUnique({
    where: { numeroInventaire },
    select: { id: true }
  });

  if (existing && existing.id !== currentStockId) {
    throw new HttpError(409, 'Ce numéro d’inventaire est déjà utilisé');
  }
}

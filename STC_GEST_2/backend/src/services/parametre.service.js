import { DEFAULT_PARAMETERS } from '../constants/defaultParameters.js';
import { prisma } from '../utils/prisma.js';

function parseValue(key, value) {
  if (['INVENTORY_COUNTER_PADDING'].includes(key)) {
    return Number(value);
  }

  return value;
}

function stringifyValue(value) {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return value;
}

export async function ensureDefaultParametres() {
  await Promise.all(
    Object.entries(DEFAULT_PARAMETERS).map(([cle, valeur]) =>
      prisma.parametre.upsert({
        where: { cle },
        update: {},
        create: { cle, valeur }
      })
    )
  );
}

export async function getParametres() {
  const rows = await prisma.parametre.findMany();

  const merged = { ...DEFAULT_PARAMETERS };
  for (const row of rows) {
    merged[row.cle] = row.valeur;
  }

  return Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [key, parseValue(key, value)])
  );
}

export async function getParametre(cle, tx = prisma) {
  const row = await tx.parametre.findUnique({ where: { cle } });

  if (!row) {
    return parseValue(cle, DEFAULT_PARAMETERS[cle]);
  }

  return parseValue(cle, row.valeur);
}

export async function updateParametres(payload) {
  const entries = Object.entries(payload || {});

  await Promise.all(
    entries.map(([cle, valeur]) =>
      prisma.parametre.upsert({
        where: { cle },
        update: { valeur: stringifyValue(valeur) },
        create: { cle, valeur: stringifyValue(valeur) }
      })
    )
  );

  return getParametres();
}

import { prisma } from '../utils/prisma.js';

export async function rechercheMaterielByValue(value) {
  const exactStock = await prisma.stock.findFirst({
    where: {
      OR: [
        { numeroInventaire: value },
        { codeBarresValeur: value },
        { qrCodeValeur: value }
      ]
    },
    include: { materiel: true }
  });

  if (exactStock) {
    return {
      mode: 'scan',
      results: [exactStock]
    };
  }

  const fuzzyResults = await prisma.stock.findMany({
    where: {
      OR: [
        { numeroInventaire: { contains: value } },
        { codeBarresValeur: { contains: value } },
        { qrCodeValeur: { contains: value } },
        { materiel: { nom: { contains: value } } },
        { materiel: { reference: { contains: value } } },
        { materiel: { marque: { contains: value } } },
        { materiel: { modele: { contains: value } } }
      ]
    },
    include: { materiel: true },
    take: 20,
    orderBy: { updatedAt: 'desc' }
  });

  return {
    mode: 'fuzzy',
    results: fuzzyResults
  };
}

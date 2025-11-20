import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { computeStockStatus, computeStockValue } from '../utils/stockStatus.util.js';

function mapMateriel(materiel) {
  if (!materiel.stock) {
    return materiel;
  }

  return {
    ...materiel,
    stock: {
      ...materiel.stock,
      prixAchat: Number(materiel.stock.prixAchat),
      valeurStock: computeStockValue(materiel.stock.quantiteActuelle, materiel.stock.prixAchat),
      statutStock: computeStockStatus(materiel.stock.quantiteActuelle, materiel.stock.stockMinimum)
    }
  };
}

export async function listMateriels() {
  const materiels = await prisma.materiel.findMany({
    include: { stock: true },
    orderBy: { createdAt: 'desc' }
  });

  return materiels.map(mapMateriel);
}

export async function getMaterielById(id) {
  const materiel = await prisma.materiel.findUnique({
    where: { id },
    include: {
      stock: true,
      mouvements: {
        orderBy: { dateMouvement: 'desc' },
        take: 20
      }
    }
  });

  if (!materiel) {
    throw new HttpError(404, 'Matériel introuvable');
  }

  return {
    ...mapMateriel(materiel),
    mouvements: materiel.mouvements.map((item) => ({
      ...item,
      prixUnitaire: item.prixUnitaire !== null ? Number(item.prixUnitaire) : null
    }))
  };
}

export async function createMateriel(payload) {
  return prisma.materiel.create({ data: payload });
}

export async function updateMateriel(id, payload) {
  const existing = await prisma.materiel.findUnique({ where: { id } });

  if (!existing) {
    throw new HttpError(404, 'Matériel introuvable');
  }

  return prisma.materiel.update({
    where: { id },
    data: payload
  });
}

export async function deleteMateriel(id) {
  const existing = await prisma.materiel.findUnique({ where: { id } });

  if (!existing) {
    throw new HttpError(404, 'Matériel introuvable');
  }

  await prisma.materiel.delete({ where: { id } });

  return { deleted: true };
}

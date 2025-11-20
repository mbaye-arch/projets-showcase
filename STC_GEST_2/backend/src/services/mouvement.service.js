import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/httpError.js';

function normalizeMovementQuantity(payload, stock) {
  if (payload.typeMouvement === 'AJUSTEMENT') {
    if (typeof payload.quantiteReelle === 'number') {
      return payload.quantiteReelle - stock.quantiteActuelle;
    }

    if (typeof payload.ecart === 'number') {
      return payload.ecart;
    }

    if (typeof payload.quantite === 'number') {
      return payload.quantite - stock.quantiteActuelle;
    }

    throw new HttpError(400, 'AJUSTEMENT requiert quantiteReelle, ecart ou quantite cible');
  }

  if (typeof payload.quantite !== 'number' || payload.quantite <= 0) {
    throw new HttpError(400, 'La quantité est obligatoire et doit être positive');
  }

  return payload.quantite;
}

function computeNextQuantity(stock, typeMouvement, amount) {
  switch (typeMouvement) {
    case 'ENTREE':
      return stock.quantiteActuelle + amount;
    case 'SORTIE':
      return stock.quantiteActuelle - amount;
    case 'RETOUR':
      return stock.quantiteActuelle + amount;
    case 'AJUSTEMENT':
      return stock.quantiteActuelle + amount;
    default:
      throw new HttpError(400, 'Type de mouvement invalide');
  }
}

export async function listMouvements() {
  const rows = await prisma.mouvementStock.findMany({
    include: { materiel: true },
    orderBy: { dateMouvement: 'desc' }
  });

  return rows.map((row) => ({
    ...row,
    prixUnitaire: row.prixUnitaire !== null ? Number(row.prixUnitaire) : null
  }));
}

export async function getMouvementById(id) {
  const movement = await prisma.mouvementStock.findUnique({
    where: { id },
    include: { materiel: true }
  });

  if (!movement) {
    throw new HttpError(404, 'Mouvement introuvable');
  }

  return {
    ...movement,
    prixUnitaire: movement.prixUnitaire !== null ? Number(movement.prixUnitaire) : null
  };
}

export async function createMouvement(payload) {
  return prisma.$transaction(async (tx) => {
    const stock = payload.materielId
      ? await tx.stock.findUnique({ where: { materielId: payload.materielId }, include: { materiel: true } })
      : await tx.stock.findUnique({ where: { numeroInventaire: payload.numeroInventaire }, include: { materiel: true } });

    if (!stock) {
      throw new HttpError(404, 'Stock introuvable pour ce mouvement');
    }

    const amount = normalizeMovementQuantity(payload, stock);
    const absQuantity = Math.abs(amount);

    if (payload.typeMouvement === 'SORTIE' && stock.quantiteActuelle < absQuantity) {
      throw new HttpError(400, 'Stock insuffisant pour effectuer la sortie');
    }

    const nextQuantity = computeNextQuantity(stock, payload.typeMouvement, amount);

    if (nextQuantity < 0) {
      throw new HttpError(400, 'Le stock ne peut pas devenir négatif');
    }

    const dateMouvement = payload.dateMouvement || new Date();

    const stockUpdateData = {
      quantiteActuelle: nextQuantity
    };

    if (payload.typeMouvement === 'ENTREE') {
      stockUpdateData.datePremiereEntree = stock.datePremiereEntree || dateMouvement;
      stockUpdateData.dateDerniereEntree = dateMouvement;
      if (payload.dateAchat) stockUpdateData.dateAchat = payload.dateAchat;
      if (payload.dateReception) stockUpdateData.dateReception = payload.dateReception;
      if (payload.prixUnitaire !== undefined) stockUpdateData.prixAchat = payload.prixUnitaire;
    }

    if (payload.typeMouvement === 'SORTIE') {
      stockUpdateData.dateDerniereSortie = dateMouvement;
    }

    if (payload.typeMouvement === 'RETOUR') {
      stockUpdateData.dateDerniereReprise = dateMouvement;
    }

    const movement = await tx.mouvementStock.create({
      data: {
        materielId: stock.materielId,
        numeroInventaire: stock.numeroInventaire,
        typeMouvement: payload.typeMouvement,
        quantite: payload.typeMouvement === 'AJUSTEMENT' ? amount : absQuantity,
        prixUnitaire: payload.prixUnitaire,
        dateMouvement,
        dateAchat: payload.dateAchat,
        dateReception: payload.dateReception,
        motif: payload.motif,
        referenceDocument: payload.referenceDocument,
        commentaire: payload.commentaire
      },
      include: { materiel: true }
    });

    await tx.stock.update({
      where: { id: stock.id },
      data: stockUpdateData
    });

    return {
      ...movement,
      prixUnitaire: movement.prixUnitaire !== null ? Number(movement.prixUnitaire) : null,
      quantiteApresMouvement: nextQuantity
    };
  });
}

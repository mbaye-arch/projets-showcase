import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/httpError.js';

export async function listInventaires() {
  return prisma.inventaire.findMany({
    include: {
      items: {
        include: { materiel: true }
      }
    },
    orderBy: { dateInventaire: 'desc' }
  });
}

export async function getInventaireById(id) {
  const inventaire = await prisma.inventaire.findUnique({
    where: { id },
    include: {
      items: {
        include: { materiel: true }
      }
    }
  });

  if (!inventaire) {
    throw new HttpError(404, 'Inventaire introuvable');
  }

  return inventaire;
}

export async function createInventaire(payload) {
  return prisma.inventaire.create({
    data: {
      dateInventaire: payload.dateInventaire || new Date(),
      commentaire: payload.commentaire
    }
  });
}

export async function addInventaireItems(inventaireId, payload) {
  return prisma.$transaction(async (tx) => {
    const inventaire = await tx.inventaire.findUnique({ where: { id: inventaireId } });

    if (!inventaire) {
      throw new HttpError(404, 'Inventaire introuvable');
    }

    const results = [];

    for (const item of payload.items) {
      const stock = await tx.stock.findUnique({
        where: { materielId: item.materielId },
        include: { materiel: true }
      });

      if (!stock) {
        throw new HttpError(404, `Stock introuvable pour materielId ${item.materielId}`);
      }

      const quantiteTheorique = stock.quantiteActuelle;
      const ecart = item.quantiteReelle - quantiteTheorique;

      const inventoryItem = await tx.inventaireItem.upsert({
        where: {
          inventaireId_materielId: {
            inventaireId,
            materielId: item.materielId
          }
        },
        update: {
          quantiteTheorique,
          quantiteReelle: item.quantiteReelle,
          ecart,
          commentaire: item.commentaire
        },
        create: {
          inventaireId,
          materielId: item.materielId,
          quantiteTheorique,
          quantiteReelle: item.quantiteReelle,
          ecart,
          commentaire: item.commentaire
        },
        include: { materiel: true }
      });

      if (payload.appliquerAjustement && ecart !== 0) {
        await tx.stock.update({
          where: { id: stock.id },
          data: {
            quantiteActuelle: item.quantiteReelle
          }
        });

        await tx.mouvementStock.create({
          data: {
            materielId: stock.materielId,
            numeroInventaire: stock.numeroInventaire,
            typeMouvement: 'AJUSTEMENT',
            quantite: ecart,
            dateMouvement: new Date(),
            motif: `Inventaire #${inventaireId}`,
            commentaire: item.commentaire || 'Ajustement suite inventaire'
          }
        });
      }

      results.push(inventoryItem);
    }

    return {
      inventaireId,
      appliquerAjustement: payload.appliquerAjustement,
      items: results
    };
  });
}

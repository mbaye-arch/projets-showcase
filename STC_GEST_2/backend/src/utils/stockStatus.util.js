export function computeStockStatus(quantiteActuelle, stockMinimum) {
  if (quantiteActuelle === 0) {
    return 'RUPTURE';
  }

  if (quantiteActuelle > 0 && quantiteActuelle <= stockMinimum) {
    return 'FAIBLE';
  }

  return 'NORMAL';
}

export function computeStockValue(quantiteActuelle, prixAchat) {
  const priceNumber = Number(prixAchat || 0);
  return Number((quantiteActuelle * priceNumber).toFixed(2));
}

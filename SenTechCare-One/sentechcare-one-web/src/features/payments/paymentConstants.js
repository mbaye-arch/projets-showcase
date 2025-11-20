export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Especes' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
  { value: 'CHECK', label: 'Cheque' },
  { value: 'OTHER', label: 'Autre' }
];

const METHOD_LABELS = PAYMENT_METHOD_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getPaymentMethodLabel(method) {
  return METHOD_LABELS[method] ?? method ?? '-';
}

export function getPaymentMethodBadgeVariant(method) {
  if (!method) {
    return 'neutral';
  }

  const normalized = String(method).toUpperCase();

  if (normalized === 'CASH') {
    return 'success';
  }

  if (normalized === 'BANK_TRANSFER' || normalized === 'MOBILE_MONEY') {
    return 'info';
  }

  if (normalized === 'CHECK') {
    return 'warning';
  }

  return 'neutral';
}

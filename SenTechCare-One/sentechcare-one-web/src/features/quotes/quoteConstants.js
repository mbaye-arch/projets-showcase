export const QUOTE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SENT', label: 'Envoye' },
  { value: 'ACCEPTED', label: 'Accepte' },
  { value: 'REJECTED', label: 'Refuse' },
  { value: 'EXPIRED', label: 'Expire' }
];

const STATUS_LABELS = QUOTE_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getQuoteStatusLabel(status) {
  return STATUS_LABELS[status] ?? status ?? '-';
}

export function getQuoteStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }

  const normalized = String(status).toUpperCase();

  if (normalized === 'ACCEPTED') {
    return 'success';
  }

  if (normalized === 'DRAFT' || normalized === 'SENT') {
    return 'info';
  }

  if (normalized === 'REJECTED') {
    return 'danger';
  }

  if (normalized === 'EXPIRED') {
    return 'warning';
  }

  return 'neutral';
}

export const EMPTY_QUOTE_ITEM = {
  description: '',
  quantity: 1,
  unitPrice: 0
};

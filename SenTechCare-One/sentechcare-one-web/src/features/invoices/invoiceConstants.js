export const INVOICE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ISSUED', label: 'Emise' },
  { value: 'PAID', label: 'Payee' },
  { value: 'PARTIALLY_PAID', label: 'Partiellement payee' },
  { value: 'UNPAID', label: 'Impayee' },
  { value: 'CANCELLED', label: 'Annulee' }
];

const STATUS_LABELS = INVOICE_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getInvoiceStatusLabel(status) {
  return STATUS_LABELS[status] ?? status ?? '-';
}

export function getInvoiceStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }

  const normalized = String(status).toUpperCase();

  if (normalized === 'PAID') {
    return 'success';
  }

  if (normalized === 'ISSUED' || normalized === 'PARTIALLY_PAID') {
    return 'info';
  }

  if (normalized === 'UNPAID') {
    return 'warning';
  }

  if (normalized === 'CANCELLED') {
    return 'danger';
  }

  return 'neutral';
}

export const EMPTY_INVOICE_ITEM = {
  description: '',
  quantity: 1,
  unitPrice: 0
};

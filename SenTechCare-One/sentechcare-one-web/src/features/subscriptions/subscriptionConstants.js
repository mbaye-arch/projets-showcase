export const PLAN_TYPE_OPTIONS = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'PREMIUM', label: 'Premium' }
];

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
  { value: 'EXPIRED', label: 'Expire' },
  { value: 'CANCELLED', label: 'Annule' }
];

export const BILLING_FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensuel' },
  { value: 'QUARTERLY', label: 'Trimestriel' },
  { value: 'SEMI_ANNUAL', label: 'Semestriel' },
  { value: 'ANNUAL', label: 'Annuel' }
];

export const SUBSCRIPTION_EXPIRATION_FILTER_OPTIONS = [
  { value: '', label: "Toutes les echeances" },
  { value: 'active', label: 'Non expires' },
  { value: 'expired', label: 'Expires' }
];

const PLAN_TYPE_LABELS = PLAN_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const SUBSCRIPTION_STATUS_LABELS = SUBSCRIPTION_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const BILLING_FREQUENCY_LABELS = BILLING_FREQUENCY_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getPlanTypeLabel(planType) {
  return PLAN_TYPE_LABELS[planType] ?? planType ?? '-';
}

export function getSubscriptionStatusLabel(status) {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status ?? '-';
}

export function getBillingFrequencyLabel(frequency) {
  return BILLING_FREQUENCY_LABELS[frequency] ?? frequency ?? '-';
}

export function getSubscriptionStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }

  const normalized = String(status).toUpperCase();
  if (normalized === 'ACTIVE') {
    return 'success';
  }
  if (normalized === 'SUSPENDED') {
    return 'warning';
  }
  if (normalized === 'EXPIRED' || normalized === 'CANCELLED') {
    return 'danger';
  }

  return 'neutral';
}

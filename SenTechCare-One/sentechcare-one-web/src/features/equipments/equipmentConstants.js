export const EQUIPMENT_CATEGORY_OPTIONS = [
  { value: 'PC', label: 'PC' },
  { value: 'LAPTOP', label: 'Laptop' },
  { value: 'PRINTER', label: 'Imprimante' },
  { value: 'ROUTER', label: 'Routeur' },
  { value: 'SWITCH', label: 'Switch' },
  { value: 'CAMERA', label: 'Camera' },
  { value: 'TV', label: 'TV' },
  { value: 'SERVER', label: 'Serveur' },
  { value: 'OTHER', label: 'Autre' }
];

export const EQUIPMENT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'BROKEN', label: 'En panne' },
  { value: 'REPLACED', label: 'Remplace' },
  { value: 'OUT_OF_SERVICE', label: 'Hors service' }
];

export const EQUIPMENT_SOURCE_OPTIONS = [
  { value: 'SENTECHCARE', label: 'SenTechCare' },
  { value: 'CLIENT', label: 'Client' }
];

const CATEGORY_LABELS = EQUIPMENT_CATEGORY_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const STATUS_LABELS = EQUIPMENT_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const SOURCE_LABELS = EQUIPMENT_SOURCE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getEquipmentCategoryLabel(value) {
  return CATEGORY_LABELS[value] ?? value ?? '-';
}

export function getEquipmentStatusLabel(value) {
  return STATUS_LABELS[value] ?? value ?? '-';
}

export function getEquipmentSourceLabel(value) {
  return SOURCE_LABELS[value] ?? value ?? '-';
}

export function getEquipmentStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }
  const normalized = String(status).toUpperCase();
  if (normalized === 'ACTIVE') {
    return 'success';
  }
  if (normalized === 'BROKEN') {
    return 'danger';
  }
  if (normalized === 'REPLACED') {
    return 'info';
  }
  if (normalized === 'OUT_OF_SERVICE') {
    return 'warning';
  }
  return 'neutral';
}

export function getEquipmentCategoryBadgeVariant(category) {
  if (!category) {
    return 'neutral';
  }

  if (['SERVER', 'ROUTER', 'SWITCH'].includes(category)) {
    return 'info';
  }
  if (['PC', 'LAPTOP', 'PRINTER'].includes(category)) {
    return 'neutral';
  }
  if (['CAMERA', 'TV'].includes(category)) {
    return 'warning';
  }
  return 'neutral';
}

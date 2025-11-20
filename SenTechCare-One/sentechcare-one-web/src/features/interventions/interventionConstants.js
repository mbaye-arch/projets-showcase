export const INTERVENTION_TYPE_OPTIONS = [
  { value: 'INSTALLATION', label: 'Installation' },
  { value: 'TROUBLESHOOTING', label: 'Depannage' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'UPDATE', label: 'Mise a jour' },
  { value: 'VISIT', label: 'Visite' },
  { value: 'OTHER', label: 'Autre' }
];

export const INTERVENTION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'SCHEDULED', label: 'Planifiee' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminee' },
  { value: 'CANCELLED', label: 'Annulee' }
];

export const PRIORITY_LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Basse' },
  { value: 'NORMAL', label: 'Normale' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'URGENT', label: 'Urgente' }
];

const TYPE_LABELS = INTERVENTION_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const STATUS_LABELS = INTERVENTION_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const PRIORITY_LABELS = PRIORITY_LEVEL_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getInterventionTypeLabel(value) {
  return TYPE_LABELS[value] ?? value ?? '-';
}

export function getInterventionStatusLabel(value) {
  return STATUS_LABELS[value] ?? value ?? '-';
}

export function getPriorityLevelLabel(value) {
  return PRIORITY_LABELS[value] ?? value ?? '-';
}

export function getInterventionStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }

  const normalized = String(status).toUpperCase();
  if (normalized === 'COMPLETED') {
    return 'success';
  }
  if (normalized === 'IN_PROGRESS' || normalized === 'SCHEDULED') {
    return 'info';
  }
  if (normalized === 'CANCELLED') {
    return 'danger';
  }
  if (normalized === 'PENDING') {
    return 'warning';
  }
  return 'neutral';
}

export function getPriorityBadgeVariant(priority) {
  if (!priority) {
    return 'neutral';
  }

  const normalized = String(priority).toUpperCase();
  if (normalized === 'LOW') {
    return 'neutral';
  }
  if (normalized === 'NORMAL') {
    return 'info';
  }
  if (normalized === 'HIGH') {
    return 'warning';
  }
  if (normalized === 'URGENT') {
    return 'danger';
  }
  return 'neutral';
}

export function getTechnicianDisplayName(technician) {
  if (!technician) {
    return '-';
  }

  const fullName = [technician.firstName, technician.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  return technician.email || `Technicien #${technician.id ?? '-'}`;
}

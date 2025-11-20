export const TICKET_CHANNEL_OPTIONS = [
  { value: 'PHONE', label: 'Telephone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'VISIT', label: 'Visite' }
];

export const TICKET_STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Ouvert' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Resolu' },
  { value: 'CLOSED', label: 'Ferme' }
];

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Basse' },
  { value: 'NORMAL', label: 'Normale' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'URGENT', label: 'Urgente' }
];

export const TICKET_TO_INTERVENTION_TYPE_OPTIONS = [
  { value: 'INSTALLATION', label: 'Installation' },
  { value: 'TROUBLESHOOTING', label: 'Depannage' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'UPDATE', label: 'Mise a jour' },
  { value: 'VISIT', label: 'Visite' },
  { value: 'OTHER', label: 'Autre' }
];

const CHANNEL_LABELS = TICKET_CHANNEL_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const STATUS_LABELS = TICKET_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const PRIORITY_LABELS = TICKET_PRIORITY_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getTicketChannelLabel(value) {
  return CHANNEL_LABELS[value] ?? value ?? '-';
}

export function getTicketStatusLabel(value) {
  return STATUS_LABELS[value] ?? value ?? '-';
}

export function getTicketPriorityLabel(value) {
  return PRIORITY_LABELS[value] ?? value ?? '-';
}

export function getTicketStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }

  const normalized = String(status).toUpperCase();
  if (normalized === 'OPEN') {
    return 'warning';
  }
  if (normalized === 'IN_PROGRESS') {
    return 'info';
  }
  if (normalized === 'RESOLVED') {
    return 'success';
  }
  if (normalized === 'CLOSED') {
    return 'neutral';
  }
  return 'neutral';
}

export function getTicketPriorityBadgeVariant(priority) {
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

export function getTicketChannelBadgeVariant(channel) {
  if (!channel) {
    return 'neutral';
  }

  const normalized = String(channel).toUpperCase();
  if (normalized === 'PHONE') {
    return 'info';
  }
  if (normalized === 'WHATSAPP') {
    return 'success';
  }
  if (normalized === 'EMAIL') {
    return 'neutral';
  }
  if (normalized === 'VISIT') {
    return 'warning';
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

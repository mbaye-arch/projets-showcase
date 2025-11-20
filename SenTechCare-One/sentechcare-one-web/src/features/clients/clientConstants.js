export const CLIENT_TYPE_OPTIONS = [
  { value: 'HOUSE', label: 'Maison' },
  { value: 'SHOP', label: 'Commerce' },
  { value: 'SCHOOL', label: 'Ecole' },
  { value: 'SME', label: 'PME' },
  { value: 'INSTITUTION', label: 'Institution' }
];

export const CLIENT_TYPE_LABELS = CLIENT_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export const ACTIVE_FILTER_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'true', label: 'Actifs uniquement' },
  { value: 'false', label: 'Inactifs uniquement' }
];

export function getClientTypeLabel(type) {
  return CLIENT_TYPE_LABELS[type] ?? type ?? '-';
}

export function getClientDisplayName(client) {
  if (!client) {
    return '-';
  }

  if (client.companyName) {
    return client.companyName;
  }

  const fullName = [client.firstName, client.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  if (client.contactPerson) {
    return client.contactPerson;
  }

  return `Client #${client.id ?? '-'}`;
}

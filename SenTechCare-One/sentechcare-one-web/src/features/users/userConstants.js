import { normalizeRoleName } from '@/lib/authorization';

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  TECHNICIAN: 'Technicien',
  SUPPORT: 'Support',
  ACCOUNTANT: 'Comptable'
};

export const ACTIVE_FILTER_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'true', label: 'Actifs' },
  { value: 'false', label: 'Inactifs' }
];

export function getRoleLabel(roleName) {
  if (!roleName) {
    return '-';
  }
  const normalized = normalizeRoleName(roleName);
  return ROLE_LABELS[normalized] ?? roleName;
}

export function getRoleBadgeVariant(roleName) {
  if (!roleName) {
    return 'neutral';
  }

  const normalized = normalizeRoleName(roleName);

  if (normalized === 'ADMIN') {
    return 'danger';
  }

  if (normalized === 'MANAGER') {
    return 'warning';
  }

  if (normalized === 'TECHNICIAN' || normalized === 'SUPPORT') {
    return 'info';
  }

  return 'neutral';
}

export function getUserStatusLabel(active) {
  return active ? 'Actif' : 'Inactif';
}

export function getUserStatusBadgeVariant(active) {
  return active ? 'success' : 'neutral';
}

export function getUserDisplayName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }
  return user?.email || 'Utilisateur';
}

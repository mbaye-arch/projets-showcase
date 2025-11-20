import { normalizeRoleName } from '@/lib/authorization';

export const moduleLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Clients', path: '/clients' },
  { label: 'Abonnements', path: '/subscriptions' },
  { label: 'Materiels', path: '/equipments' },
  { label: 'Interventions', path: '/interventions' },
  { label: 'Tickets', path: '/tickets' },
  { label: 'Devis', path: '/quotes' },
  { label: 'Factures', path: '/invoices' },
  { label: 'Paiements', path: '/payments' },
  {
    label: 'Utilisateurs',
    path: '/users',
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPPORT']
  }
];

export function getModuleLinksByRole(roleName) {
  if (!roleName) {
    return moduleLinks.filter((link) => !Array.isArray(link.allowedRoles));
  }

  const normalizedRole = normalizeRoleName(roleName);
  return moduleLinks.filter(
    (link) => !Array.isArray(link.allowedRoles) || link.allowedRoles.includes(normalizedRole)
  );
}

export function normalizeRoleName(roleName) {
  return String(roleName || '')
    .toUpperCase()
    .replace(/^ROLE_/, '');
}

export function hasRole(user, roleName) {
  if (!user?.roleName || !roleName) {
    return false;
  }
  return normalizeRoleName(user.roleName) === normalizeRoleName(roleName);
}

export function hasAnyRole(user, roleNames = []) {
  if (!Array.isArray(roleNames) || roleNames.length === 0) {
    return false;
  }
  return roleNames.some((roleName) => hasRole(user, roleName));
}

export function canManageUsers(user) {
  return hasAnyRole(user, ['ADMIN', 'MANAGER']);
}

export function canReadUsers(user) {
  return hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPPORT']);
}

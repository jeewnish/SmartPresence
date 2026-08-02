export const USER_ROLES = Object.freeze({
  STUDENT: 'student',
  LECTURER: 'lecturer',
});


export function normalizeUserRole(role) {
  if (typeof role !== 'string') return null;

  const normalizedRole = role.trim().toLowerCase().replace(/^role_/, '');

  return Object.values(USER_ROLES).includes(normalizedRole)
    ? normalizedRole
    : null;
}

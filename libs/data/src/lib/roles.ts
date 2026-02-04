export enum Role {
  Owner = 'owner',
  Admin = 'admin',
  Viewer = 'viewer',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.Owner]: [Role.Admin, Role.Viewer],
  [Role.Admin]: [Role.Viewer],
  [Role.Viewer]: [],
};

export function roleHasAtLeast(userRole: Role, requiredRole: Role): boolean {
  if (userRole === requiredRole) return true;
  const inherited = ROLE_HIERARCHY[userRole] ?? [];
  return inherited.includes(requiredRole) || inherited.some((r) => roleHasAtLeast(r, requiredRole));
}

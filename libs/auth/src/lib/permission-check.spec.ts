import { hasPermission, getPermissionsForRole } from './permission-check';
import { Role } from '@bturbovets/data';
import { Permission } from '@bturbovets/data';

describe('hasPermission', () => {
  it('owner has task:create and audit:read', () => {
    expect(hasPermission(Role.Owner, Permission.TaskCreate)).toBe(true);
    expect(hasPermission(Role.Owner, Permission.AuditLogRead)).toBe(true);
  });

  it('viewer has only task:read', () => {
    expect(hasPermission(Role.Viewer, Permission.TaskRead)).toBe(true);
    expect(hasPermission(Role.Viewer, Permission.TaskDelete)).toBe(false);
  });

  it('getPermissionsForRole returns array', () => {
    expect(getPermissionsForRole(Role.Admin).length).toBeGreaterThan(0);
  });
});

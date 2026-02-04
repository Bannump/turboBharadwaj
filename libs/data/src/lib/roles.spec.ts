import { Role, roleHasAtLeast } from './roles';

describe('roleHasAtLeast', () => {
  it('owner has at least admin and viewer', () => {
    expect(roleHasAtLeast(Role.Owner, Role.Admin)).toBe(true);
    expect(roleHasAtLeast(Role.Owner, Role.Viewer)).toBe(true);
  });

  it('admin has at least viewer', () => {
    expect(roleHasAtLeast(Role.Admin, Role.Viewer)).toBe(true);
  });

  it('viewer has only viewer', () => {
    expect(roleHasAtLeast(Role.Viewer, Role.Viewer)).toBe(true);
    expect(roleHasAtLeast(Role.Viewer, Role.Admin)).toBe(false);
  });
});

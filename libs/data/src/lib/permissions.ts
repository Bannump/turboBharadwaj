export enum Permission {
  TaskCreate = 'task:create',
  TaskRead = 'task:read',
  TaskUpdate = 'task:update',
  TaskDelete = 'task:delete',
  AuditLogRead = 'audit:read',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditLogRead,
  ],
  admin: [
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditLogRead,
  ],
  viewer: [Permission.TaskRead],
};

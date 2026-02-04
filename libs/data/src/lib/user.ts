import { Role } from './roles';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

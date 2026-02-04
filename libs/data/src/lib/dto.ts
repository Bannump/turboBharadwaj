import { TaskStatus } from './task';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: { id: string; email: string; role: string; organizationId: string };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  category?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: string;
  orderIndex?: number;
}

export interface AuditLogEntryDto {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string;
  userEmail: string;
  timestamp: Date;
  details?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ITask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: string;
  orderIndex: number;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

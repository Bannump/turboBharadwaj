import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = '/api';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: string;
  orderIndex: number;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);

  list(category?: string, status?: string): Observable<Task[]> {
    let params: Record<string, string> = {};
    if (category) params['category'] = category;
    if (status) params['status'] = status;
    return this.http.get<Task[]>(`${API}/tasks`, { params });
  }

  create(dto: { title: string; description?: string; status?: TaskStatus; category?: string }): Observable<Task> {
    return this.http.post<Task>(`${API}/tasks`, dto);
  }

  update(id: string, dto: Partial<{ title: string; description: string; status: TaskStatus; category: string; orderIndex: number }>): Observable<Task> {
    return this.http.put<Task>(`${API}/tasks/${id}`, dto);
  }

  delete(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${API}/tasks/${id}`);
  }

  reorder(ids: string[]): Observable<Task[]> {
    return this.http.post<Task[]>(`${API}/tasks/reorder`, { ids });
  }
}

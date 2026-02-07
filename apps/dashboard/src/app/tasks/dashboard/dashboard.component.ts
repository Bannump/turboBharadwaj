import { Component, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../../auth/auth.service';
import { TaskService, Task, TaskStatus } from '../task.service';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
const CATEGORIES = ['General', 'Work', 'Personal'];
const DARK_MODE_STORAGE_KEY = 'task-dashboard-dark-mode';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  filterCategory = signal<string>('');
  filterStatus = signal<string>('');
  sortBy = signal<'order' | 'title' | 'status'>('order');
  darkMode = signal(this.getInitialDarkMode());
  showForm = signal(false);
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formDescription = signal('');
  formStatus = signal<TaskStatus>('todo');
  formCategory = signal('General');
  loading = signal(false);
  error = signal('');

  user = this.auth.currentUser;

  filteredTasks = computed(() => {
    let list = this.tasks();
    const cat = this.filterCategory();
    const status = this.filterStatus();
    if (cat) list = list.filter((t) => t.category === cat);
    if (status) list = list.filter((t) => t.status === status);
    const sort = this.sortBy();
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'status') list = [...list].sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));
    return list;
  });

  /** Task completion stats for bar chart: counts per status and percentages. */
  completionStats = computed(() => {
    const list = this.tasks();
    const total = list.length;
    const todo = list.filter((t) => t.status === 'todo').length;
    const inProgress = list.filter((t) => t.status === 'in_progress').length;
    const done = list.filter((t) => t.status === 'done').length;
    return {
      total,
      todo,
      inProgress,
      done,
      todoPct: total ? (todo / total) * 100 : 0,
      inProgressPct: total ? (inProgress / total) * 100 : 0,
      donePct: total ? (done / total) * 100 : 0,
    };
  });

  private getInitialDarkMode(): boolean {
    if (typeof localStorage === 'undefined') return !!(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return !!(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  }

  constructor() {
    effect(() => {
      const dark = this.darkMode();
      if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', dark);
      if (typeof localStorage !== 'undefined') localStorage.setItem(DARK_MODE_STORAGE_KEY, String(dark));
    });
    this.loadTasks();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
    if (event.key === 'Escape') {
      if (this.showForm()) this.closeForm();
      return;
    }
    if (inInput) return;
    const isNewTaskShortcut = (event.ctrlKey || event.metaKey) && event.altKey && (event.key === 'N' || event.key === 'n');
    if (isNewTaskShortcut) {
      event.preventDefault();
      this.openCreate();
    }
  }

  loadTasks(): void {
    this.loading.set(true);
    const cat = this.filterCategory() || undefined;
    const status = this.filterStatus() || undefined;
    this.taskService.list(cat, status).subscribe({
      next: (list) => { this.tasks.set(list); this.loading.set(false); },
      error: () => { this.error.set('Failed to load tasks'); this.loading.set(false); },
    });
  }

  toggleDark(): void {
    this.darkMode.update((v) => !v);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formStatus.set('todo');
    this.formCategory.set('General');
    this.showForm.set(true);
  }

  openEdit(t: Task): void {
    this.editingId.set(t.id);
    this.formTitle.set(t.title);
    this.formDescription.set(t.description || '');
    this.formStatus.set(t.status);
    this.formCategory.set(t.category);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveTask(): void {
    const id = this.editingId();
    const title = this.formTitle().trim();
    if (!title) return;
    this.error.set('');
    if (id) {
      this.taskService.update(id, {
        title,
        description: this.formDescription() || undefined,
        status: this.formStatus(),
        category: this.formCategory(),
      }).subscribe({
        next: (updated) => {
          this.tasks.update((list) => list.map((t) => (t.id === id ? updated : t)));
          this.closeForm();
        },
        error: (e) => this.error.set(e.error?.message || 'Update failed'),
      });
    } else {
      this.taskService.create({
        title,
        description: this.formDescription() || undefined,
        status: this.formStatus(),
        category: this.formCategory(),
      }).subscribe({
        next: (created) => {
          this.tasks.update((list) => [...list, created].sort((a, b) => a.orderIndex - b.orderIndex));
          this.closeForm();
        },
        error: (e) => this.error.set(e.error?.message || 'Create failed'),
      });
    }
  }

  deleteTask(t: Task): void {
    if (!confirm('Delete this task?')) return;
    this.taskService.delete(t.id).subscribe({
      next: () => this.tasks.update((list) => list.filter((x) => x.id !== t.id)),
      error: (e) => this.error.set(e.error?.message || 'Delete failed'),
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    const list = [...this.filteredTasks()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    const ids = list.map((x) => x.id);
    this.taskService.reorder(ids).subscribe({
      next: (reordered) => this.tasks.set(reordered),
      error: () => this.error.set('Reorder failed'),
    });
  }

  logout(): void {
    this.auth.logout();
  }

  statusLabel(s: TaskStatus): string {
    return s === 'in_progress' ? 'In progress' : s === 'todo' ? 'To do' : 'Done';
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

// Use minimal template to avoid loading external HTML
const MINIMAL_TEMPLATE = '<div>Test</div>';
import { TaskService, Task } from '../task.service';
import { AuthService } from '../../auth/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let taskListSpy: jest.Mock;
  let taskCreateSpy: jest.Mock;
  let taskUpdateSpy: jest.Mock;
  let taskDeleteSpy: jest.Mock;
  let taskReorderSpy: jest.Mock;
  let authLogoutSpy: jest.Mock;

  const mockTasks: Task[] = [
    {
      id: 't1',
      title: 'Task 1',
      description: null,
      status: 'todo',
      category: 'General',
      orderIndex: 0,
      organizationId: 'org1',
      createdById: 'u1',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  ];

  beforeEach(async () => {
    taskListSpy = jest.fn().mockReturnValue(of(mockTasks));
    taskCreateSpy = jest.fn();
    taskUpdateSpy = jest.fn();
    taskDeleteSpy = jest.fn();
    taskReorderSpy = jest.fn();

    const mockAuth = {
      currentUser: signal({ id: 'u1', email: 'user@acme.com', role: 'owner', organizationId: 'org1' }),
      logout: jest.fn(),
    };
    authLogoutSpy = mockAuth.logout as jest.Mock;

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: TaskService,
          useValue: {
            list: taskListSpy,
            create: taskCreateSpy,
            update: taskUpdateSpy,
            delete: taskDeleteSpy,
            reorder: taskReorderSpy,
          },
        },
        { provide: AuthService, useValue: mockAuth },
      ],
    })
      .overrideComponent(DashboardComponent, {
        set: { template: MINIMAL_TEMPLATE, templateUrl: undefined!, styleUrls: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadTasks fetches tasks and populates signal', () => {
    expect(taskListSpy).toHaveBeenCalled();
    expect(component.tasks()).toEqual(mockTasks);
  });

  it('filteredTasks filters by category', () => {
    component.tasks.set(mockTasks);
    component.filterCategory.set('Work');
    fixture.detectChanges();
    expect(component.filteredTasks().length).toBe(0);

    component.filterCategory.set('General');
    fixture.detectChanges();
    expect(component.filteredTasks().length).toBe(1);
  });

  it('openCreate sets showForm and resets form fields', () => {
    component.openCreate();
    expect(component.showForm()).toBe(true);
    expect(component.editingId()).toBeNull();
    expect(component.formTitle()).toBe('');
    expect(component.formStatus()).toBe('todo');
    expect(component.formCategory()).toBe('General');
  });

  it('openEdit populates form with task data', () => {
    const task = mockTasks[0];
    component.openEdit(task);
    expect(component.showForm()).toBe(true);
    expect(component.editingId()).toBe('t1');
    expect(component.formTitle()).toBe('Task 1');
  });

  it('closeForm hides form', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBe(false);
    expect(component.editingId()).toBeNull();
  });

  it('saveTask does nothing when title is empty', () => {
    component.formTitle.set('');
    component.saveTask();
    expect(taskCreateSpy).not.toHaveBeenCalled();
    expect(taskUpdateSpy).not.toHaveBeenCalled();
  });

  it('saveTask creates task when no editingId', () => {
    const created = { ...mockTasks[0], id: 't2', title: 'New' };
    taskCreateSpy.mockReturnValue(of(created));
    component.editingId.set(null);
    component.formTitle.set('New');
    component.formDescription.set('');
    component.formStatus.set('todo');
    component.formCategory.set('General');
    component.tasks.set([]);

    component.saveTask();

    expect(taskCreateSpy).toHaveBeenCalledWith({
      title: 'New',
      description: undefined,
      status: 'todo',
      category: 'General',
    });
    expect(component.tasks()).toContainEqual(created);
  });

  it('logout calls auth.logout', () => {
    component.logout();
    expect(authLogoutSpy).toHaveBeenCalled();
  });

  it('statusLabel returns correct labels', () => {
    expect(component.statusLabel('todo')).toBe('To do');
    expect(component.statusLabel('in_progress')).toBe('In progress');
    expect(component.statusLabel('done')).toBe('Done');
  });
});

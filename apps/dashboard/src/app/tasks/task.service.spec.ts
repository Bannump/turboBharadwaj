import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 't1',
    title: 'Test Task',
    description: 'Desc',
    status: 'todo',
    category: 'General',
    orderIndex: 0,
    organizationId: 'org1',
    createdById: 'u1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list() fetches tasks from GET /api/tasks', () => {
    service.list().subscribe((tasks) => {
      expect(tasks).toEqual([mockTask]);
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([mockTask]);
  });

  it('list() passes category and status as query params', () => {
    service.list('Work', 'done').subscribe();

    const req = httpMock.expectOne((r) => r.url.startsWith('/api/tasks'));
    expect(req.request.params.get('category')).toBe('Work');
    expect(req.request.params.get('status')).toBe('done');
    req.flush([]);
  });

  it('create() POSTs to /api/tasks', () => {
    service.create({ title: 'New Task' }).subscribe((task) => {
      expect(task.title).toBe('New Task');
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New Task' });
    req.flush({ ...mockTask, title: 'New Task' });
  });

  it('update() PUTs to /api/tasks/:id', () => {
    service.update('t1', { title: 'Updated' }).subscribe((task) => {
      expect(task.title).toBe('Updated');
    });

    const req = httpMock.expectOne('/api/tasks/t1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Updated' });
    req.flush({ ...mockTask, title: 'Updated' });
  });

  it('delete() sends DELETE to /api/tasks/:id', () => {
    service.delete('t1').subscribe((res) => {
      expect(res.deleted).toBe(true);
    });

    const req = httpMock.expectOne('/api/tasks/t1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ deleted: true });
  });

  it('reorder() POSTs ids to /api/tasks/reorder', () => {
    service.reorder(['t1', 't2', 't3']).subscribe((tasks) => {
      expect(tasks).toEqual([]);
    });

    const req = httpMock.expectOne('/api/tasks/reorder');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ids: ['t1', 't2', 't3'] });
    req.flush([]);
  });
});

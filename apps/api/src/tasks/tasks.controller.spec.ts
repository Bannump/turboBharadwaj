import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { User } from '../entities/user.entity';
import { Role } from '@bturbovets/data';

const mockUser: User = {
  id: 'user-1',
  email: 'owner@acme.com',
  passwordHash: 'hash',
  role: Role.Owner,
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

describe('TasksController (endpoints)', () => {
  let app: INestApplication;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
  };

  const mockJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      ctx.switchToHttp().getRequest().user = mockUser;
      return true;
    },
  };
  const mockPermissionsGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Override ReqUser decorator - use a custom param decorator for tests
    const httpAdapter = app.getHttpAdapter();
    await app.init();

    // mockJwtGuard sets request.user = mockUser for @ReqUser()
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  const withAuth = (req: request.Test) => req.set('Authorization', 'Bearer fake-token');

  it('POST /tasks creates task with valid dto', async () => {
    const created = { id: 't1', title: 'New Task', status: 'todo', category: 'General', orderIndex: 0, organizationId: 'org-1', createdById: 'user-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: null };
    mockTasksService.create.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', 'Bearer token')
      .send({ title: 'New Task' })
      .expect(201);

    expect(mockTasksService.create).toHaveBeenCalled();
  });

  it('GET /tasks returns list from service', async () => {
    mockTasksService.findAll.mockResolvedValue([]);

    const res = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(res.body).toEqual([]);
    expect(mockTasksService.findAll).toHaveBeenCalled();
  });

  it('GET /tasks/:id returns task from service', async () => {
    const task = { id: 't1', title: 'Task', status: 'todo', category: 'General', orderIndex: 0 };
    mockTasksService.findOne.mockResolvedValue(task);

    const res = await request(app.getHttpServer())
      .get('/tasks/t1')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(res.body.title).toBe('Task');
  });

  it('PUT /tasks/:id updates task', async () => {
    const updated = { id: 't1', title: 'Updated', status: 'done', category: 'Work', orderIndex: 0 };
    mockTasksService.update.mockResolvedValue(updated);

    await request(app.getHttpServer())
      .put('/tasks/t1')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Updated', status: 'done', category: 'Work' })
      .expect(200);

    expect(mockTasksService.update).toHaveBeenCalled();
  });

  it('DELETE /tasks/:id removes task', async () => {
    mockTasksService.remove.mockResolvedValue({ deleted: true });

    await request(app.getHttpServer())
      .delete('/tasks/t1')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(mockTasksService.remove).toHaveBeenCalledWith('t1', expect.any(Object));
  });

  it('POST /tasks/reorder calls reorder service', async () => {
    mockTasksService.reorder.mockResolvedValue([]);
    const ids = ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'];

    await request(app.getHttpServer())
      .post('/tasks/reorder')
      .set('Authorization', 'Bearer token')
      .send({ ids })
      .expect(201);

    expect(mockTasksService.reorder).toHaveBeenCalledWith(ids, expect.any(Object));
  });

  it('POST /tasks rejects missing title (validation)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', 'Bearer token')
      .send({ description: 'No title' })
      .expect(400);

    expect(mockTasksService.create).not.toHaveBeenCalled();
  });
});

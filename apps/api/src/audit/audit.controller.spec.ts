import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
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

describe('AuditController (endpoints)', () => {
  let app: INestApplication;

  const mockAuditService = {
    getLogs: jest.fn(),
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
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockAuditService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /audit-log returns logs from service', async () => {
    mockAuditService.getLogs.mockResolvedValue([
      { id: '1', action: 'CREATE', resource: 'task', userId: 'u1', userEmail: 'user@acme.com', timestamp: new Date() },
    ]);

    const res = await request(app.getHttpServer())
      .get('/audit-log')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].action).toBe('CREATE');
    expect(mockAuditService.getLogs).toHaveBeenCalledWith('org-1', 100);
  });

  it('GET /audit-log?limit=10 passes limit to service', async () => {
    mockAuditService.getLogs.mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/audit-log')
      .query({ limit: '10' })
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(mockAuditService.getLogs).toHaveBeenCalledWith('org-1', 10);
  });
});

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

describe('AuthController (endpoints)', () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '7d' } }),
      ],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login returns 200 and token for valid credentials', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'jwt-token',
      user: { id: '1', email: 'owner@acme.com', role: 'owner', organizationId: 'org1' },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@acme.com', password: 'password123' })
      .expect(201);

    expect(res.body.access_token).toBe('jwt-token');
    expect(res.body.user.email).toBe('owner@acme.com');
    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'owner@acme.com', password: 'password123' });
  });

  it('POST /auth/login returns 401 for invalid credentials', async () => {
    mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@acme.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/login rejects invalid email (validation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'password123' })
      .expect(400);

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('POST /auth/login rejects short password (validation)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@acme.com', password: '12345' })
      .expect(400);

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});

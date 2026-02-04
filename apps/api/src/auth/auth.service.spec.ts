import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Role } from '@bturbovets/data';

jest.mock('bcrypt', () => ({ compare: jest.fn().mockResolvedValue(true) }));

describe('AuthService', () => {
  let service: AuthService;
  const mockUserRepo = {
    findOne: jest.fn(),
  };
  const mockJwt = { sign: jest.fn(() => 'token') };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login rejects invalid credentials', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);
    await expect(service.login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });

  it('login returns token for valid user', async () => {
    const user = {
      id: '1',
      email: 'owner@acme.com',
      passwordHash: '$2b$10$dummy',
      role: Role.Owner,
      organizationId: 'org1',
    } as User;
    mockUserRepo.findOne.mockResolvedValue(user);
    const res = await service.login({ email: 'owner@acme.com', password: 'password123' });
    expect(res.access_token).toBe('token');
    expect(res.user.email).toBe('owner@acme.com');
  });
});

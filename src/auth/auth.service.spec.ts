import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
//mocking the prisma service
const mockPrismaService = {
  account: {
    findUnique: jest.fn(),
  },
};

// mocking the jwtService
const mockJwtService = {
  signAsync: jest.fn().mockImplementation(() => 'mocked.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a login response with valid credentials', async () => {
      const authPayload = { username: 'testuser', password: 'password123' };
      const hashedPassword = await bcrypt.hash(authPayload.password, 10);
      const mockUser = {
        username: authPayload.username,
        password: hashedPassword,
        id: 1,
        staffCode: 'SD0001',
        status: 'ACTIVE',
        type: 'USER',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockUser);

      // Execute the login method
      const result = await service.login(authPayload);

      // Assertions
      expect(result.accessToken).toBe('mocked.token');
      expect(result.refreshToken).toBe('mocked.token');
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { username: authPayload.username },
      });
      // Called for accessToken and refreshToken
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
    // case username not exist
    it('should throw UnauthorizedException if username does not exist', async () => {
      const authPayload = {
        username: 'nonexistentuser',
        password: 'password123',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(service.login(authPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { username: authPayload.username },
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
  // case user is disabled
  it('should throw UnauthorizedException if account is disabled', async () => {
    const authPayload = { username: 'testuser', password: 'password123' };
    const mockUser = {
      username: authPayload.username,
      password: 'hashedpassword',
      id: 1,
      staffCode: 'SD0001',
      status: 'DISABLED',
      type: 'USER',
    };

    mockPrismaService.account.findUnique.mockResolvedValue(mockUser);

    await expect(service.login(authPayload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
      where: { username: authPayload.username },
    });
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  // case: username or password incorrect
  it('should throw UnauthorizedException if password is incorrect', async () => {
    const authPayload = { username: 'testuser', password: 'incorrectpassword' };
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser = {
      username: authPayload.username,
      password: hashedPassword,
      id: 1,
      staffCode: 'SD0001',
      status: 'ACTIVE',
      type: 'USER',
    };

    mockPrismaService.account.findUnique.mockResolvedValue(mockUser);

    await expect(service.login(authPayload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
      where: { username: authPayload.username },
    });
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });
});

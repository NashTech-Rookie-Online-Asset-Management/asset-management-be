import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
//mocking the prisma service
const mockPrismaService = {
  account: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

// mocking the jwtService
const mockJwtService = {
  signAsync: jest.fn().mockImplementation(() => 'mocked.token'),
  verify: jest.fn(),
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

  describe('changePassword', () => {
    it('should change password successfully with valid old password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const mockUser = {
        username: 'testuser',
        password: await bcrypt.hash('oldpassword', 10),
        id: 1,
        staffCode: 'SD0001',
        status: 'ACTIVE',
        type: 'USER',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockUser);

      const result = await service.changePassword(
        mockUser.staffCode,
        changePasswordDto,
      );

      expect(result.message).toBe(
        'Your password has been changed successfully',
      );
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { staffCode: mockUser.staffCode },
        data: { password: expect.any(String), status: 'ACTIVE' },
      });
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'incorrectoldpassword',
        newPassword: 'newpassword',
      };
      const mockUser = {
        username: 'testuser',
        password: await bcrypt.hash('oldpassword', 10),
        id: 1,
        staffCode: 'SD0001',
        status: 'ACTIVE',
        type: 'USER',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(mockUser.staffCode, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistentstaffCode', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };
      const mockUser = {
        username: 'testuser',
        password: 'hashedpassword',
        id: 1,
        staffCode: 'SD0001',
        status: 'ACTIVE',
        type: 'USER',
      };
      mockJwtService.verify.mockReturnValue({ staffCode: mockUser.staffCode });
      mockPrismaService.account.findUnique.mockResolvedValue(mockUser);
      const result = await service.refresh(refreshTokenDto);

      expect(result.accessToken).toBe('mocked.token');
      expect(result.refreshToken).toBe('mocked.token');
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'valid_refresh_token',
        {
          ignoreExpiration: true,
        },
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { staffCode: mockUser.staffCode },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid_refresh_token',
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'invalid_refresh_token',
        { ignoreExpiration: true },
      );
      expect(mockPrismaService.account.findUnique).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      mockJwtService.verify.mockReturnValue({
        staffCode: 'nonexistentStaffCode',
      });
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'valid_refresh_token',
        {
          ignoreExpiration: true,
        },
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { staffCode: 'nonexistentStaffCode' },
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});

import { UnauthorizedException } from '@nestjs/common';
import {
  mockJwtService,
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { RefreshTokenDto } from 'src/auth/dto';

describe('AuthService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      (mockJwtService.verify as jest.Mock).mockReturnValue({
        staffCode: mockUser.staffCode,
      });
      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
      const result = await service.refresh(refreshTokenDto);

      expect(result.accessToken).toBe('mocked.token');
      expect(result.refreshToken).toBe('mocked.token');
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { staffCode: mockUser.staffCode },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid_refresh_token',
      };

      (mockJwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'invalid_refresh_token',
      );
      expect(mockPrismaService.account.findUnique).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: undefined,
      };

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verify).not.toHaveBeenCalled();
      expect(mockPrismaService.account.findUnique).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      (mockJwtService.verify as jest.Mock).mockReturnValue({
        staffCode: 'nonexistentStaffCode',
      });
      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { staffCode: 'nonexistentStaffCode' },
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});

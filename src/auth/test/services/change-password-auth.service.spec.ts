import { UnauthorizedException } from '@nestjs/common';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { ChangePasswordDto } from 'src/auth/dto';
import * as bcrypt from 'bcryptjs';
describe('AuthService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );

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

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );

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

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.changePassword('nonexistentstaffCode', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });
  });
});

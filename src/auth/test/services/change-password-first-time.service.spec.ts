import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { ChangePasswordFirstTimeDto } from 'src/auth/dto';
import * as bcrypt from 'bcryptjs';
import { AccountType, Location, UserStatus } from '@prisma/client';
describe('AuthService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changePasswordFirstTime', () => {
    it('should change password successfully with a new valid password', async () => {
      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'newpassword',
      };
      const mockUser = {
        username: 'username',
        password: await bcrypt.hash('oldpassword', 10),
        id: 1,
        staffCode: 'SD0001',
        status: UserStatus.ACTIVE,
        type: AccountType.ADMIN,
        location: Location.HCM,
      };
      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (mockPrismaService.account.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash('newpassword', 10),
      });

      const result = await service.changePasswordFirstTime(
        mockUser.staffCode,
        changePasswordFirstTimeDto,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { staffCode: mockUser.staffCode },
        data: { password: expect.any(String), status: 'ACTIVE' },
      });
    });

    it('should throw BadRequestException if new password is the same as the old password', async () => {
      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'oldpassword',
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
        service.changePasswordFirstTime(
          mockUser.staffCode,
          changePasswordFirstTimeDto,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'newpassword',
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.changePasswordFirstTime(
          'nonexistentstaffCode',
          changePasswordFirstTimeDto,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'newpassword',
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.changePasswordFirstTime(
          'nonexistentstaffCode',
          changePasswordFirstTimeDto,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
    });
  });
});

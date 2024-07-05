import { Account, AccountType, Location, UserStatus } from '@prisma/client';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { adminMockup, user } from './config/mock-data';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Messages } from 'src/common/constants';

describe('UsersService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should successfully retrieve user when valid staffCode and permissions', async () => {
      const staffCode = 'valid_staff_code';

      const mockUser = {
        id: 2,
        staffCode,
        location: Location.HCM,
      };
      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.selectOne(staffCode, adminMockup)).resolves.toEqual(
        mockUser,
      );

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { staffCode },
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          type: true,
          joinedAt: true,
          username: true,
          location: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
    it('should throw NotFoundException when user not found', async () => {
      const staffCode = 'non_existent_staff_code';
      const liveUser = {
        id: 1,
        type: AccountType.ROOT,
        location: Location.HCM,
      };
      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.selectOne(staffCode, liveUser)).rejects.toThrow(
        new NotFoundException(Messages.USER.FAILED.NOT_FOUND),
      );

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { staffCode },
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          type: true,
          joinedAt: true,
          username: true,
          location: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
    it('should throw ForbiddenException when liveUser type is not ROOT and locations do not match', async () => {
      const mockUser: Partial<Account> = {
        id: 1,
        staffCode: 'S123',
        location: Location.DN,
        status: UserStatus.ACTIVE,
      };

      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.selectOne('S123', adminMockup)).rejects.toThrow(
        ForbiddenException,
      );
    });
    it('should throw ForbiddenException when user status is DISABLED', async () => {
      const mockLiveUser: Partial<Account> = {
        ...adminMockup,
        status: UserStatus.DISABLED,
      };

      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValue(
        user,
      );

      await expect(service.selectOne('S123', mockLiveUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when attempting to view own profile', async () => {
      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValue(
        adminMockup,
      );

      await expect(service.selectOne('S123', adminMockup)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

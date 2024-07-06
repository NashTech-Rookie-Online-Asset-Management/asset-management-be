import {
  AccountType,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { adminMockup, mockUser } from './config/mock-data';
import { BadRequestException } from '@nestjs/common';
import { Messages } from 'src/common/constants';

describe('UsersService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('disable', () => {
    it('should disable a user successfully', async () => {
      const userStaffCode = 'SD0002';

      // Mock the return value of PrismaService methods for findUnique and update

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        staffCode: userStaffCode,
        assignedTos: [
          {
            state: AssignmentState.IS_REQUESTED,
            returningRequest: { state: RequestState.COMPLETED },
          },
        ],
      });
      (mockPrismaService.account.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: UserStatus.DISABLED,
      });

      const result = await service.disable(adminMockup, userStaffCode);

      expect(result.status).toEqual(UserStatus.DISABLED);
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { staffCode: userStaffCode },
        include: {
          assignedTos: {
            where: {
              state: {
                in: [
                  AssignmentState.WAITING_FOR_ACCEPTANCE,
                  AssignmentState.ACCEPTED,
                  AssignmentState.IS_REQUESTED,
                ],
              },
            },
            include: {
              returningRequest: {
                where: {
                  state: RequestState.WAITING_FOR_RETURNING,
                },
              },
            },
          },
        },
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { staffCode: userStaffCode },
        data: { status: UserStatus.DISABLED },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          status: true,
        },
      });
    });

    it('should throw BadRequestException if user is not found', async () => {
      const userStaffCode = 'SD0002';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user has valid assignments', async () => {
      const userStaffCode = 'SD0002';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        staffCode: userStaffCode,
        assignedTos: [{ state: AssignmentState.ACCEPTED }],
      });

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        BadRequestException,
      );
    });

    // This account is disabled
    it('should throw BadRequestException if disable your own account', async () => {
      const userStaffCode = 'SD0001';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: 1,
      });

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.DISABLE_OWN_ACCOUNT),
      );
    });
    it('should throw BadRequestException if disabled same type', async () => {
      const userStaffCode = 'SD0001';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        type: AccountType.ADMIN,
      });

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.DISABLE_SAME_TYPE),
      );
    });
    it('should throw BadRequestException if account already disabled', async () => {
      const userStaffCode = 'SD0001';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: UserStatus.DISABLED,
      });

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.DISABLED_ALREADY),
      );
    });

    it('should throw BadRequestException if account not same location', async () => {
      const userStaffCode = 'SD0001';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        location: Location.HN,
      });

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        new BadRequestException(
          Messages.USER.FAILED.DISABLED_NOT_SAME_LOCATION,
        ),
      );
    });
    it('should throw BadRequestException if account disable is root', async () => {
      const userStaffCode = 'SD0001';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,

        type: AccountType.ROOT,
      });

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.DISABLED_ROOT),
      );
    });
  });
});

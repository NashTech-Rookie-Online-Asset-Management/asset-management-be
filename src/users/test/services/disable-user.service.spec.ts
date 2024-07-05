import {
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
import { adminMockup } from './config/mock-data';
import { BadRequestException } from '@nestjs/common';

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
      const mockUser = {
        staffCode: userStaffCode,
        assignedTos: [],
        assignedBys: [],
        location: Location.HCM,
      };
      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
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

      const mockUser = {
        staffCode: userStaffCode,
        assignedTos: [{ state: AssignmentState.ACCEPTED }],
        assignedBys: [],
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.disable(adminMockup, userStaffCode)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

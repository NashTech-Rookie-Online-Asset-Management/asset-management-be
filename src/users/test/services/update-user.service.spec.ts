import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { adminMockup, mockUser, updateUserDto } from './config/mock-data';
import {
  AccountType,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import { UpdateUserDto } from 'src/users/dto';

describe('UsersService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    const userStaffCode = 'SD0002';

    const existingUser = {
      staffCode: userStaffCode,
      dob: new Date('1990-01-01'),
      gender: 'FEMALE',
      joinedAt: new Date('2020-01-01'),
      type: AccountType.STAFF,
      location: Location.HCM,
    };
    it('should update a user successfully', async () => {
      updateUserDto.dob = new Date('2001-06-17');

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      jest.spyOn(service as any, 'findUser').mockResolvedValue(existingUser);
      (mockPrismaService.account.update as jest.Mock).mockResolvedValue(
        updatedUser,
      );

      const result = await service.update(
        adminMockup,
        userStaffCode,
        updateUserDto,
      );

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { staffCode: userStaffCode },
        data: {
          dob: updateUserDto.dob,
          gender: updateUserDto.gender,
          joinedAt: updateUserDto.joinedAt,
          type: updateUserDto.type,
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
    });

    it('should throw BadRequestException if joined date is invalid', async () => {
      updateUserDto.joinedAt = new Date('2015-01-01');
      jest.spyOn(service as any, 'findUser').mockResolvedValue(existingUser);

      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.JOINED_DATE_UNDER_AGE),
      );
    });
    it('should throw NotFoundException user not found', async () => {
      await expect(
        service.update(adminMockup, null, updateUserDto),
      ).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.NOT_FOUND),
      );
    });

    it('should throw BadRequestException if joined date is on a weekend', async () => {
      const userStaffCode = 'SD0002';

      updateUserDto.dob = new Date('1990-01-01');
      updateUserDto.joinedAt = new Date('2024-06-16');
      existingUser.dob = new Date('1990-01-01');
      jest.spyOn(service as any, 'findUser').mockResolvedValue(existingUser);

      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.JOINED_WEEKEND),
      );
    });

    it('should throw BadRequestException on error', async () => {
      const error = {
        message: 'Update failed',
        response: {
          error: 'Conflict',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        statusCode: HttpStatus.BAD_REQUEST,
      };
      const userStaffCode = 'SD0002';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('1990-01-01'),
        gender: 'MALE',
        joinedAt: new Date('2024-06-17'),
        type: AccountType.ADMIN,
      };

      const existingUser = {
        staffCode: userStaffCode,
        dob: new Date('1990-01-01'),
        gender: 'FEMALE',
        joinedAt: new Date('2020-01-01'),
        type: AccountType.STAFF,
        location: Location.HCM,
      };

      jest.spyOn(service as any, 'findUser').mockResolvedValue(existingUser);
      (mockPrismaService.account.update as jest.Mock).mockRejectedValue(
        new HttpException(error, error.statusCode),
      );

      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(HttpException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const userStaffCode = 'SD0002';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('1990-01-01'),
        gender: 'MALE',
        joinedAt: new Date('2024-06-17'),
        type: AccountType.ADMIN,
      };

      jest
        .spyOn(service as any, 'findUser')
        .mockRejectedValue(
          new UnauthorizedException(Messages.USER.FAILED.NOT_FOUND),
        );

      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(
        new UnauthorizedException(Messages.USER.FAILED.NOT_FOUND),
      );
    });
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

    //You can not update your own account
    it('should throw error if You can not update your own account', async () => {
      const userStaffCode = 'SD0002';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('1990-01-01'),
        gender: 'FEMALE',
        joinedAt: new Date('2020-01-01'),
        type: AccountType.STAFF,
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
      await expect(
        service.update(
          { ...adminMockup, staffCode: userStaffCode },
          userStaffCode,
          updateUserDto,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if You can only update the user within the same location', async () => {
      const userStaffCode = 'SD0002';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('1990-01-01'),
        gender: 'FEMALE',
        joinedAt: new Date('2020-01-01'),
        type: AccountType.STAFF,
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        location: Location.DN,
      });
      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(HttpException);
    });

    it('should throw conflict exception if concurrent update', async () => {
      const userStaffCode = 'SD0002';

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (mockPrismaService.account.update as jest.Mock).mockRejectedValue({
        ...mockUser,
      });

      try {
        await Promise.all([
          service.update(adminMockup, userStaffCode, updateUserDto),
          service.update(adminMockup, userStaffCode, updateUserDto),
          service.update(adminMockup, userStaffCode, updateUserDto),
          service.update(adminMockup, userStaffCode, updateUserDto),
        ]);
        fail('Should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(Messages.USER.FAILED.CONCURRENT_UPDATE);
      }
    });

    //update same type
    it('should throw conflict exception if update same type', async () => {
      const userStaffCode = 'SD0002';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('1990-01-01'),
        gender: 'FEMALE',
        joinedAt: new Date('2020-01-01'),
        type: AccountType.STAFF,
      };
      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        location: Location.HCM,
        type: AccountType.ADMIN,
      });
      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.UPDATE_SAME_TYPE),
      );
    });

    it('Should not edit user if different version is provided', async () => {
      const date_1 = new Date('2021-01-01');
      const date_2 = new Date('2021-01-02');
      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        location: Location.HCM,
        updatedAt: date_2,
      });

      try {
        await Promise.all([
          service.update(adminMockup, 'SD0002', {
            ...updateUserDto,
            updatedAt: date_1,
          }),
        ]);
        fail('Should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(Messages.USER.FAILED.DATA_EDITED);
      }
    });

    it('should throw BadRequestException if joinedAt is less than or equal to dob', async () => {
      // Mock data
      const adminUser = {
        staffCode: 'admin123',
        type: AccountType.ADMIN,
        location: Location.HCM,
      };
      const updateUserDto: UpdateUserDto = {
        joinedAt: new Date('1990-01-01'), // Example date where joinedAt is before dob
      };

      const userExisted = {
        staffCode: 'user123',
        dob: new Date('2000-01-01'), // Example dob
        location: Location.HCM,
      };

      // Mock findUser method
      jest.spyOn(service as any, 'findUser').mockResolvedValue(userExisted);

      // Execute and assert
      await expect(
        service.update(adminUser as any, 'user123', updateUserDto),
      ).rejects.toThrow(HttpException);
      await expect(
        service.update(adminUser as any, 'user123', updateUserDto),
      ).rejects.toThrow(Messages.USER.FAILED.JOINED_AFTER_DOB);
    });
  });
});

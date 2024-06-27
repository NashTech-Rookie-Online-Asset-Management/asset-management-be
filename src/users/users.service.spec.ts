import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, FindAllUsersSortKey, UpdateUserDto } from './dto';
import {
  AccountType,
  AssignmentState,
  Gender,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import { UsersService } from './users.service';
import { Messages, Order } from 'src/common/constants';
import { UserType } from './types';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: PrismaService;

  beforeEach(async () => {
    mockPrismaService = {
      account: {
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUser: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1990-01-01'),
      joinedAt: new Date('2024-06-17'),
      gender: 'MALE',
      type: 'STAFF',
      location: Location.HCM,
    };

    const mockedCreateReturnValue = {
      staffCode: 'SD0002',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johnd',
      gender: 'MALE',
      dob: new Date('2024-06-17'),
      joinedAt: new Date('2024-06-17'),
      type: 'STAFF',
      location: Location.HCM,
    };
    it('should create a user successfully', async () => {
      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockResolvedValue(
        mockedCreateReturnValue,
      );
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.create(adminMockup, createUserDto);

      expect(result).toEqual(mockedCreateReturnValue);
      expect(mockPrismaService.account.count).toHaveBeenCalled();
      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          dob: new Date('1990-01-01'),
          joinedAt: new Date('2024-06-17'),
          gender: Gender.MALE,
          type: AccountType.STAFF,
          username: 'johnd',
          password: 'hashedpassword',
          location: Location.HCM,
        },
        select: {
          staffCode: true,
          firstName: true,
          dob: true,
          gender: true,
          lastName: true,
          username: true,
          joinedAt: true,
          location: true,
          password: true,
          type: true,
        },
      });
    });

    it('should throw BadRequestException if create fails', async () => {
      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(service.create(adminMockup, createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUsers', () => {
    it('should find users by location with pagination and sorting', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        sortField: FindAllUsersSortKey.FIRST_NAME,
        sortOrder: Order.ASC,
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          assignedTos: [],
        },
        {
          id: 2,
          staffCode: 'SD0002',
          firstName: 'Jane',
          lastName: 'Smith',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(10);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(10);

      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [],
        },
        orderBy: [
          {
            firstName: 'asc',
          },
        ],
        take: dto.take,
        skip: dto.skip,
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
    });

    it('should search users by name and staffCode (case-insensitive)', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        search: 'doe',
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'DOE',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [
            {
              fullName: {
                contains: dto.search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
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
    });

    it('should filter users by types', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        types: [AccountType.STAFF],
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'DOE',
          updatedAt: undefined,
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [],
          type: {
            in: dto.types,
          },
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
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
    });
  });

  describe('getUser', () => {
    const user = {
      id: 1,
      staffCode: 'SD0001',
      username: 'nicolad',
      status: UserStatus.ACTIVE,
      type: AccountType.ADMIN,
      location: Location.HCM,
    };
    it('should get user', async () => {
      const username = 'test_user';
      const expected = {
        id: 2,
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: username,
        location: Location.HCM,
      };

      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValueOnce(
        expected,
      );

      const result = await service.selectOne(username, user);

      expect(result).toEqual(expected);
      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { username },
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          username: true,
          dob: true,
          gender: true,
          joinedAt: true,
          type: true,
          location: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('update', () => {
    const userStaffCode = 'SD0002';
    const updateUserDto: UpdateUserDto = {
      dob: new Date('2010-01-01'),
      gender: 'MALE',
      joinedAt: new Date('2024-06-17'),
      type: AccountType.STAFF,
    };

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
          dob: true,
          gender: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
    });

    it('should throw BadRequestException if joined date is invalid', async () => {
      updateUserDto.joinedAt = new Date('1990-01-01');
      jest.spyOn(service as any, 'findUser').mockResolvedValue(existingUser);

      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(
        new BadRequestException(Messages.USER.FAILED.JOINED_DATE_UNDER_AGE),
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
        new Error('Update failed'),
      );

      await expect(
        service.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow(new BadRequestException('Update failed'));
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
  });

  describe('getUsers', () => {
    it('should find users by location with pagination and sorting', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          assignedTos: [],
        },
        {
          id: 2,
          staffCode: 'SD0002',
          firstName: 'Jane',
          lastName: 'Smith',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(10);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(10);

      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [],
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
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
    });

    it('should search users by name and staffCode (case-insensitive)', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        search: 'doe',
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'DOE',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [
            {
              fullName: {
                contains: dto.search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
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
    });

    it('should filter users by types', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        types: [AccountType.STAFF],
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'DOE',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [],
          type: {
            in: dto.types,
          },
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
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
    });
  });
});

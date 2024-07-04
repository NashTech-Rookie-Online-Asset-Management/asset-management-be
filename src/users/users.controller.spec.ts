import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { AccountType, Location, UserStatus } from '@prisma/client';

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UpdateUserDto, UserPaginationDto } from './dto';
import { UserType } from './types';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};
describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    update: jest.fn(),
    selectMany: jest.fn(),
    selectOne: jest.fn(),
    disable: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { role: AccountType.ADMIN };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        joinedAt: new Date('2024-06-17'),
        gender: 'MALE',
        type: 'ADMIN',
        location: Location.HCM,
      };

      const result = {
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(adminMockup, createUserDto)).toEqual(
        result,
      );
      expect(usersService.create).toHaveBeenCalledWith(
        adminMockup,
        createUserDto,
      );
    });

    it('should throw an error if the user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        joinedAt: new Date('2024-06-17'),
        gender: 'MALE',
        type: 'ADMIN',
        location: Location.HCM,
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(
        controller.create(adminMockup, createUserDto),
      ).rejects.toThrow('Failed to create user');
      expect(usersService.create).toHaveBeenCalledWith(
        adminMockup,
        createUserDto,
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userStaffCode = 'SD0001';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('2000-01-01'),
        gender: 'MALE',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      const result = {
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      mockUsersService.update = jest.fn().mockResolvedValue(result);

      expect(
        await controller.update(adminMockup, userStaffCode, updateUserDto),
      ).toEqual(result);
      expect(usersService.update).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
        updateUserDto,
      );
    });

    it('should throw an error if the user update fails', async () => {
      const userStaffCode = 'SD0001';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('2000-01-01'),
        gender: 'MALE',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      mockUsersService.update = jest
        .fn()
        .mockRejectedValue(new Error('Failed to update user'));

      await expect(
        controller.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow('Failed to update user');
      expect(usersService.update).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
        updateUserDto,
      );
    });
  });

  describe('getUsers', () => {
    it('should return a list of users successfully', async () => {
      const username = 'admin';
      const dto: UserPaginationDto = { page: 1, take: 10, skip: 1 };

      const result = [
        {
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johnd',
          joinedAt: new Date('2024-06-17'),
          type: 'ADMIN',
          location: Location.HCM,
        },
      ];

      mockUsersService.selectMany.mockResolvedValue(result);

      expect(await controller.getUsers(username, adminMockup, dto)).toEqual(
        result,
      );
      expect(usersService.selectMany).toHaveBeenCalledWith(
        username,
        adminMockup,
        dto,
      );
    });

    it('should throw an error if retrieving users fails', async () => {
      const username = 'admin';
      const dto: UserPaginationDto = { page: 1, take: 10, skip: 1 };

      mockUsersService.selectMany.mockRejectedValue(
        new Error('Failed to retrieve users'),
      );

      await expect(
        controller.getUsers(username, adminMockup, dto),
      ).rejects.toThrow('Failed to retrieve users');
      expect(usersService.selectMany).toHaveBeenCalledWith(
        username,
        adminMockup,
        dto,
      );
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
    it('should return a user successfully', async () => {
      const staffCode = 'SD0001';

      const result = {
        id: '1',
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        joinedAt: new Date('2024-06-17'),
        type: AccountType.ADMIN,
        location: Location.HCM,
      };

      mockUsersService.selectOne.mockResolvedValue(result);

      expect(await controller.getUser(staffCode, user)).toEqual(result);
      expect(usersService.selectOne).toHaveBeenCalledWith(staffCode, user);
    });

    it('should throw an error if retrieving the user fails', async () => {
      const username = 'johnd';

      mockUsersService.selectOne.mockRejectedValue(
        new Error('Failed to retrieve user'),
      );

      await expect(controller.getUser(username, user)).rejects.toThrow(
        'Failed to retrieve user',
      );
      expect(usersService.selectOne).toHaveBeenCalledWith(username, user);
    });
  });

  describe('disabledUser', () => {
    it('should disable a user successfully', async () => {
      const userStaffCode = 'SD0002';
      const result = { success: true };

      mockUsersService.disable.mockResolvedValue(result);

      expect(await controller.disabledUser(adminMockup, userStaffCode)).toEqual(
        result,
      );
      expect(usersService.disable).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
      );
    });

    it('should throw an error if disabling the user fails', async () => {
      const userStaffCode = 'SD0001';

      mockUsersService.disable.mockRejectedValue(
        new Error('Failed to disable user'),
      );

      await expect(
        controller.disabledUser(adminMockup, userStaffCode),
      ).rejects.toThrow('Failed to disable user');
      expect(usersService.disable).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
      );
    });
  });
});

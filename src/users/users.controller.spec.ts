import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { AccountType, Location } from '@prisma/client';

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
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

      expect(await controller.create(createUserDto)).toEqual(result);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
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

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Failed to create user',
      );
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});

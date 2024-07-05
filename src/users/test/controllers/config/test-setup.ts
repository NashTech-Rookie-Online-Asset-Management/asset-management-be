import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountType } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

export let controller: UsersController;
export let usersService: UsersService;
export const mockUsersService = {
  create: jest.fn(),
  update: jest.fn(),
  selectMany: jest.fn(),
  selectOne: jest.fn(),
  disable: jest.fn(),
};
export const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

export const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { role: AccountType.ADMIN };
    return true;
  }),
};
export const setupTestController = async () => {
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
};

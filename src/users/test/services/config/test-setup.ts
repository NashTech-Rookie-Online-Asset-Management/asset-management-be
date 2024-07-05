import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from 'src/lock/lock.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

export let service: UsersService;
export let mockPrismaService: PrismaService;

export const setupTestModule = async () => {
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
      LockService,
    ],
  }).compile();

  service = module.get<UsersService>(UsersService);
};

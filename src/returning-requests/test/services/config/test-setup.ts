import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from 'src/lock/lock.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturningRequestsService } from 'src/returning-requests/returning-requests.service';

export let service: ReturningRequestsService;
export let prismaService: PrismaService;
export const setupTestModule = async () => {
  prismaService = {
    returningRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    assignment: {
      update: jest.fn(),
    },
    asset: {
      update: jest.fn(),
    },
  } as any;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ReturningRequestsService,
      {
        provide: PrismaService,
        useValue: prismaService,
      },

      LockService,
    ],
  }).compile();

  service = module.get<ReturningRequestsService>(ReturningRequestsService);
  prismaService = module.get<PrismaService>(PrismaService);
};

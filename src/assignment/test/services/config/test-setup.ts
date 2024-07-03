import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetService } from 'src/asset/asset.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { LockService } from 'src/lock/lock.service';

export let service: AssignmentService;
export let mockPrisma: PrismaService;

const mockAssetService = {
  updateState: jest.fn(),
};

export const setupTestModule = async () => {
  mockPrisma = {
    account: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    asset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AssignmentService,
      {
        provide: PrismaService,
        useValue: mockPrisma,
      },
      {
        provide: AssetService,
        useValue: mockAssetService,
      },
      LockService,
    ],
  }).compile();

  service = module.get<AssignmentService>(AssignmentService);
};

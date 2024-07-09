import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from 'src/asset/asset.service';
import { LockService } from 'src/lock/lock.service';
import { PrismaService } from 'src/prisma/prisma.service';

export let assetService: AssetService;
export let prismaService: PrismaService;
export let lockService: LockService;

export const setupTestModule = async () => {
  prismaService = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    asset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AssetService,
      {
        provide: PrismaService,
        useValue: prismaService,
      },

      LockService,
    ],
  }).compile();

  assetService = module.get<AssetService>(AssetService);
};

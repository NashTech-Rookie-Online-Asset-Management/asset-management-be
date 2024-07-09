import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from 'src/category/category.service';
import { PrismaService } from 'src/prisma/prisma.service';

export let service: CategoryService;
export let mockPrismaService: PrismaService;

export const setupTestModule = async () => {
  mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CategoryService,
      {
        provide: PrismaService,
        useValue: mockPrismaService,
      },
    ],
  }).compile();

  service = module.get<CategoryService>(CategoryService);
};

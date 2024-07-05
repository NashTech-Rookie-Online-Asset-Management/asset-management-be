import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from 'src/category/category.controller';
import { CategoryService } from 'src/category/category.service';

export let controller: CategoryController;
export let service: CategoryService;
export const mockCategoryService = {
  create: jest.fn((dto) => {
    return {
      id: Date.now(),
      ...dto,
    };
  }),
  findAll: jest.fn(() => {
    return [{ id: 1, name: 'Laptop', prefix: 'LP' }];
  }),
  findOne: jest.fn((id) => {
    return { id, name: 'Laptop', prefix: 'LP' };
  }),
  update: jest.fn((id, dto) => {
    return { id, ...dto };
  }),
  remove: jest.fn((id) => {
    return { id, name: 'Laptop', prefix: 'LP' };
  }),
};

export const setupTestController = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [CategoryController],
    providers: [
      {
        provide: CategoryService,
        useValue: mockCategoryService,
      },
    ],
  }).compile();

  controller = module.get<CategoryController>(CategoryController);
  service = module.get<CategoryService>(CategoryService);
};

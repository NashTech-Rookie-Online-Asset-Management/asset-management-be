import { BadRequestException } from '@nestjs/common';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { Messages } from 'src/common/constants';
import { CreateCategoryDto } from 'src/category/dto';

describe('CategoryService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (mockPrismaService.category.create as jest.Mock).mockResolvedValue(
        createCategoryDto,
      );

      expect(await service.create(createCategoryDto)).toEqual(
        createCategoryDto,
      );
    });

    it('should throw an error if category name already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue({
        name: 'Laptop',
      });

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.NAME_EXIST),
      );
    });

    it('should throw an error if category prefix already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue({
        prefix: 'LP',
      });

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST),
      );
    });
  });
});

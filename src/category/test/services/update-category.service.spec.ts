import { BadRequestException } from '@nestjs/common';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { Messages } from 'src/common/constants';
import { UpdateCategoryDto } from 'src/category/dto';

describe('CategoryService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop Updated',
        prefix: 'LU',
      };
      const existingCategory = {
        id: 1,
        name: 'Laptop',
        prefix: 'LP',
        assets: [],
      };
      (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
        existingCategory,
      );
      (mockPrismaService.category.update as jest.Mock).mockResolvedValue(
        updateCategoryDto,
      );

      expect(await service.update(1, updateCategoryDto)).toEqual(
        updateCategoryDto,
      );
    });

    it('should throw an error if updated name already exists', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      const existingCategory = {
        id: 1,
        name: 'Laptop',
        prefix: 'LP',
        assets: [],
      };
      const conflictingCategory = {
        id: 2,
        name: 'Laptop',
        prefix: 'LU',
        assets: [],
      };

      (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
        existingCategory,
      );
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
        conflictingCategory,
      );

      await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.NAME_EXIST),
      );
    });
    it('should throw an error if updated prefix already exists', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop Updated',
        prefix: 'LP',
      };
      const existingCategory = {
        id: 1,
        name: 'Laptop',
        prefix: 'LP',
        assets: [],
      };
      const conflictingCategory = {
        id: 2,
        name: 'Laptop Updatedd',
        prefix: 'LP',
        assets: [],
      };

      (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
        existingCategory,
      );
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
        conflictingCategory,
      );

      await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST),
      );
    });
  });

  it('should throw an error if category not found', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Laptop Updated',
      prefix: 'LP',
    };
    (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
      null,
    );
    await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
      new BadRequestException(Messages.CATEGORY.FAILED.NOT_FOUND),
    );
  });

  //Category is assigned to an asset. Please delete all associated assets first
  it('should throw an error if category is assigned to an asset', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Laptop Updated',
      prefix: 'LP',
    };
    const existingCategory = {
      id: 1,
      name: 'Laptop',
      prefix: 'LP',
      assets: [{ id: 1 }],
    };
    (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
      existingCategory,
    );
    await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
      new BadRequestException(
        Messages.CATEGORY.FAILED.CATEGORY_CAN_NOT_BE_CHANGED,
      ),
    );
  });

  it('should throw an error if updated name already exists', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Laptop',
      prefix: 'LP',
    };
    const existingCategory = {
      id: 1,
      name: 'Laptop',
      prefix: 'LP',
      assets: [],
    };
    const conflictingCategory = {
      id: 2,
      name: 'Laptop',
      prefix: 'LU',
      assets: [],
    };

    (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
      existingCategory,
    );
    (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
      conflictingCategory,
    );

    await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
      new BadRequestException(Messages.CATEGORY.FAILED.NAME_EXIST),
    );
  });

  it('should throw an error if updated prefix already exists', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      prefix: 'LP',
    };
    const existingCategory = {
      id: 1,
      name: 'Laptop',
      prefix: 'LP',
      assets: [],
    };
    const conflictingCategory = {
      id: 2,
      name: 'Laptop',
      prefix: 'LP',
      assets: [],
    };

    (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
      existingCategory,
    );
    (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
      conflictingCategory,
    );

    await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
      new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST),
    );
  });
});

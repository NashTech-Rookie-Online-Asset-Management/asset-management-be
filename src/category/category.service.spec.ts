import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BadRequestException } from '@nestjs/common';
import { Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';

const mockPrismaService = {
  category: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(createCategoryDto);

      expect(await service.create(createCategoryDto)).toEqual(
        createCategoryDto,
      );
    });

    it('should throw an error if category name already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      mockPrismaService.category.findFirst.mockResolvedValue({
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
      mockPrismaService.category.findFirst.mockResolvedValue({ prefix: 'LP' });

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [{ name: 'Laptop', prefix: 'LP' }];
      mockPrismaService.category.findMany.mockResolvedValue(categories);

      expect(await service.findAll()).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      const category = { name: 'Laptop', prefix: 'LP' };
      mockPrismaService.category.findUnique.mockResolvedValue(category);

      expect(await service.findOne(1)).toEqual(category);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop Updated',
        prefix: 'LU',
      };
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.update.mockResolvedValue(updateCategoryDto);

      expect(await service.update(1, updateCategoryDto)).toEqual(
        updateCategoryDto,
      );
    });

    it('should throw an error if updated name already exists', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      mockPrismaService.category.findFirst.mockResolvedValue({
        name: 'Laptop',
        id: 2,
      });

      await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.NAME_EXIST),
      );
    });

    it('should throw an error if updated prefix already exists', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      mockPrismaService.category.findFirst.mockResolvedValue({
        prefix: 'LP',
        id: 2,
      });

      await expect(service.update(1, updateCategoryDto)).rejects.toThrow(
        new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST),
      );
    });
  });

  describe('remove', () => {
    it('should delete a category if it has no assets', async () => {
      const category = { id: 1, name: 'Laptop', prefix: 'LP', assets: [] };
      mockPrismaService.category.findFirst.mockResolvedValue(category);
      mockPrismaService.category.delete.mockResolvedValue(category);

      expect(await service.remove(1)).toEqual(category);
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { assets: true },
      });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});

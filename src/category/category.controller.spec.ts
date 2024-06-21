import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
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

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Laptop',
        prefix: 'LP',
      };
      expect(await controller.create(createCategoryDto)).toEqual({
        id: expect.any(Number),
        ...createCategoryDto,
      });
      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      expect(await controller.findAll()).toEqual([
        { id: 1, name: 'Laptop', prefix: 'LP' },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      const id = 1;
      expect(await controller.findOne(id)).toEqual({
        id,
        name: 'Laptop',
        prefix: 'LP',
      });
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const id = 1;
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Laptop Updated',
        prefix: 'LU',
      };
      expect(await controller.update(id, updateCategoryDto)).toEqual({
        id,
        ...updateCategoryDto,
      });
      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      const id = 1;
      expect(await controller.remove(id)).toEqual({
        id,
        name: 'Laptop',
        prefix: 'LP',
      });
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});

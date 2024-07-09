import { CreateCategoryDto } from 'src/category/dto';
import { controller, service, setupTestController } from './config/test-setup';

describe('CategoryController', () => {
  beforeEach(async () => {
    await setupTestController();
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
      expect(await controller.create(createCategoryDto)).toEqual({
        id: expect.any(Number),
        ...createCategoryDto,
      });
      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
    });
  });
});

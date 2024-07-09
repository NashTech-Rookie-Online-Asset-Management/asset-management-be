import { UpdateCategoryDto } from 'src/category/dto';
import { controller, service, setupTestController } from './config/test-setup';

describe('CategoryController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
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
});

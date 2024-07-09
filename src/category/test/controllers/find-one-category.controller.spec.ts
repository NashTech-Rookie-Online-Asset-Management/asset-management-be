import { controller, service, setupTestController } from './config/test-setup';

describe('CategoryController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
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
});

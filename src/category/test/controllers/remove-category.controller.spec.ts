import { controller, service, setupTestController } from './config/test-setup';

describe('CategoryController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
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

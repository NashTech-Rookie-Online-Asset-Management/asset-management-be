import { controller, service, setupTestController } from './config/test-setup';

describe('CategoryController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      expect(await controller.findAll()).toEqual([
        { id: 1, name: 'Laptop', prefix: 'LP' },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});

import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';

describe('CategoryService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [{ name: 'Laptop', prefix: 'LP' }];
      (mockPrismaService.category.findMany as jest.Mock).mockResolvedValue(
        categories,
      );

      expect(await service.findAll()).toEqual(categories);
    });
  });
});

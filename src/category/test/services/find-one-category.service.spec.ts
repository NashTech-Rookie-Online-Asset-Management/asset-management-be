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

  describe('findOne', () => {
    it('should return a single category', async () => {
      const category = { name: 'Laptop', prefix: 'LP' };
      (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
        category,
      );

      expect(await service.findOne(1)).toEqual(category);
    });
  });
});

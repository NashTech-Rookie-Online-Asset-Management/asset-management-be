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

  describe('remove', () => {
    it('should delete a category if it has no assets', async () => {
      const category = { id: 1, name: 'Laptop', prefix: 'LP', assets: [] };
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
        category,
      );
      (mockPrismaService.category.delete as jest.Mock).mockResolvedValue(
        category,
      );

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

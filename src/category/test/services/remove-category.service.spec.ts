import { Messages } from 'src/common/constants';
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

    it('should throw an error if category not found', async () => {
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.remove(1)).rejects.toThrow(
        Messages.CATEGORY.FAILED.NOT_FOUND,
      );
    });

    it('should throw an error if category is assigned to an asset', async () => {
      const category = { id: 1, name: 'Laptop', prefix: 'LP', assets: [1] };
      (mockPrismaService.category.findFirst as jest.Mock).mockResolvedValue(
        category,
      );
      await expect(service.remove(1)).rejects.toThrow(
        Messages.CATEGORY.FAILED.CATEGORY_CAN_NOT_BE_DELETED,
      );
    });
  });
});

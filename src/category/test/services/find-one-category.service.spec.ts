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

  describe('findOne', () => {
    it('should return a single category', async () => {
      const category = { name: 'Laptop', prefix: 'LP' };
      (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
        category,
      );

      expect(await service.findOne(1)).toEqual(category);
    });

    it('should throw an error if category not found', async () => {
      (mockPrismaService.category.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.findOne(1)).rejects.toThrowError(
        Messages.CATEGORY.FAILED.NOT_FOUND,
      );
    });
  });
});

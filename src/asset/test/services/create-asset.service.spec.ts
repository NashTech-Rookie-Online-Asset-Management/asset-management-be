import { Location } from '@prisma/client';
import {
  assetService,
  prismaService,
  setupTestModule,
} from './config/test-setup';
import { HttpException } from '@nestjs/common';
import { createAssetDto } from './config/mock-data';
import { Messages } from 'src/common/constants';

describe('AssetService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const location = Location.HCM;

    it('should throw BadRequestException if location is null', async () => {
      await expect(assetService.create(null, createAssetDto)).rejects.toThrow(
        HttpException,
      );
      await expect(assetService.create(null, createAssetDto)).rejects.toThrow(
        Messages.ASSET.FAILED.INVALID_LOCATION,
      );
    });

    it('should throw BadRequestException if location is undefined', async () => {
      await expect(
        assetService.create(undefined, createAssetDto),
      ).rejects.toThrow(HttpException);
      await expect(
        assetService.create(undefined, createAssetDto),
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
    });

    it('should create and return the asset', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Laptop',
      });
      (prismaService.asset.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Laptop HP Probook 450 G1',
        categoryId: 1,
        specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
        location: Location.HCM,
      });

      const result = await assetService.create(location, createAssetDto);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Laptop HP Probook 450 G1');
      expect(result).toHaveProperty('categoryId', 1);
      expect(result).toHaveProperty(
        'specification',
        'Intel Core i5, 8GB RAM, 256GB SSD',
      );
      expect(result).toHaveProperty('location', Location.HCM);
    });
  });
});

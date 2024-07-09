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

    //category not found
    it('should throw BadRequestException if category not found', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        assetService.create(location, createAssetDto),
      ).rejects.toThrow(HttpException);
      await expect(
        assetService.create(location, createAssetDto),
      ).rejects.toThrow(Messages.ASSET.FAILED.CATEGORY_NOT_FOUND);
    });

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

    it('should create and return the asset when there is no existing asset in the category', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Laptop',
        prefix: 'LAP',
      });
      (prismaService.asset.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.asset.create as jest.Mock).mockResolvedValue({
        id: 1,
        assetCode: 'LAP000001',
        name: 'Laptop HP Probook 450 G1',
        specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
        location: Location.HCM,
        state: 'AVAILABLE',
        category: {
          name: 'Laptop',
          prefix: 'LAP',
        },
        assignments: [],
      });

      const result = await assetService.create(location, createAssetDto);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('assetCode', 'LAP000001');
      expect(result).toHaveProperty('name', 'Laptop HP Probook 450 G1');
      expect(result).toHaveProperty(
        'specification',
        'Intel Core i5, 8GB RAM, 256GB SSD',
      );
      expect(result).toHaveProperty('location', Location.HCM);
      expect(result).toHaveProperty('state', 'AVAILABLE');
    });

    it('should create and return the asset when there is an existing asset in the category', async () => {
      const lastAsset = {
        id: 1,
        assetCode: 'LAP000123',
        name: 'Laptop Dell XPS 13',
        categoryId: 1,
        specification: 'Intel Core i7, 16GB RAM, 512GB SSD',
        location: Location.HCM,
      };

      (prismaService.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Laptop',
        prefix: 'LAP',
      });
      (prismaService.asset.findFirst as jest.Mock).mockResolvedValue(lastAsset);
      (prismaService.asset.create as jest.Mock).mockResolvedValue({
        id: 2,
        assetCode: 'LAP000124',
        name: 'Laptop HP Probook 450 G1',
        specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
        location: Location.HCM,
        state: 'AVAILABLE',
        category: {
          name: 'Laptop',
          prefix: 'LAP',
        },
        assignments: [],
      });

      const result = await assetService.create(location, createAssetDto);

      expect(result).toHaveProperty('id', 2);
      expect(result).toHaveProperty('assetCode', 'LAP000124');
      expect(result).toHaveProperty('name', 'Laptop HP Probook 450 G1');
      expect(result).toHaveProperty(
        'specification',
        'Intel Core i5, 8GB RAM, 256GB SSD',
      );
      expect(result).toHaveProperty('location', Location.HCM);
      expect(result).toHaveProperty('state', 'AVAILABLE');
    });
  });
});

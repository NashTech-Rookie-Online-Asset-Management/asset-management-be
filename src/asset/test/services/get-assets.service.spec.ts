import { AssetState, Location } from '@prisma/client';
import {
  assetService,
  prismaService,
  setupTestModule,
} from './config/test-setup';
import { BadRequestException } from '@nestjs/common';
import { Messages, Order } from 'src/common/constants';
import { AssetPageOptions } from 'src/asset/dto';

describe('AssetService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAssets', () => {
    const location = Location.HCM;

    it('should throw BadRequestException if location is null', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
      };

      await expect(assetService.getAssets(null, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(assetService.getAssets(null, dto)).rejects.toThrow(
        Messages.ASSET.FAILED.INVALID_LOCATION,
      );
    });

    it('should throw BadRequestException if location is undefined', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
      };

      await expect(assetService.getAssets(undefined, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(assetService.getAssets(undefined, dto)).rejects.toThrow(
        Messages.ASSET.FAILED.INVALID_LOCATION,
      );
    });

    it('should throw BadRequestException if location is invalid', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
      };

      await expect(
        assetService.getAssets('ABC' as Location, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        assetService.getAssets('ABC' as Location, dto),
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
    });

    it('should throw BadRequestException if some categories do not exist', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        categoryIds: [1, 2, 3],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await expect(assetService.getAssets(location, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(assetService.getAssets(location, dto)).rejects.toThrow(
        Messages.ASSET.FAILED.CATEGORY_NOT_FOUND,
      );
    });

    it('should return empty assets and pagination data', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
      };

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(0);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.totalCount).toBe(0);
    });

    it('should return empty assets and pagination data if skip is greater than total count', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 10,
      };

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(0);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.totalCount).toBe(0);
    });

    it('should return assets and pagination data with search query', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        search: 'Laptop HP Probook 450 G1',
      };

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(1);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(1);
    });

    it('should return assets and pagination data with order query', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        sortField: 'assetCode',
        sortOrder: Order.ASC,
      };

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(1);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(1);
    });

    it('should return assets and pagination data with category query', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        categoryIds: [1],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(1);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(1);
    });

    it('should return assets and pagination data with multiple category queries', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        categoryIds: [1, 2],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
        {
          id: 2,
          assetCode: 'MO100001',
          name: 'Monitor Dell UltraSharp',
          state: AssetState.AVAILABLE,
          category: { id: 2, name: 'Monitor' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(2);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(2);
    });

    it('should return assets and pagination data with all queries', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        search: 'Laptop HP Probook 450 G1',
        sortField: 'assetCode',
        sortOrder: Order.ASC,
        categoryIds: [1],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(1);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(1);
    });

    it('should return assets with multiple states', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 0,
        states: [AssetState.ASSIGNED, AssetState.AVAILABLE],
      };

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.ASSIGNED,
          category: { id: 1, name: 'Laptop' },
        },
        {
          id: 2,
          assetCode: 'MO100001',
          name: 'Monitor Dell UltraSharp',
          state: AssetState.AVAILABLE,
          category: { id: 2, name: 'Monitor' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(2);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(2);
    });

    it('should return assets in page 2', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 10,
      };

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(11);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalCount).toBe(11);
    });

    it('should return assets with all queries and in page 2', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 10,
        search: 'Laptop HP Probook 450 G1',
        sortField: 'assetCode',
        sortOrder: Order.ASC,
        categoryIds: [1],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.AVAILABLE,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(11);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalCount).toBe(11);
    });

    it('should return assets with all queries and in page 2 with multiple states', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 10,
        search: 'Laptop HP Probook 450 G1',
        sortField: 'assetCode',
        sortOrder: Order.ASC,
        categoryIds: [1],
        states: [AssetState.ASSIGNED, AssetState.AVAILABLE],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.ASSIGNED,
          category: { id: 1, name: 'Laptop' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(11);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalCount).toBe(11);
    });

    it('should return assets with all queries and in page 2 with multiple states and multiple categories', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 10,
        sortField: 'assetCode',
        sortOrder: Order.ASC,
        categoryIds: [1, 2],
        states: [AssetState.ASSIGNED, AssetState.AVAILABLE],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.ASSIGNED,
          category: { id: 1, name: 'Laptop' },
        },
        {
          id: 2,
          assetCode: 'MO100001',
          name: 'Monitor Dell UltraSharp',
          state: AssetState.AVAILABLE,
          category: { id: 2, name: 'Monitor' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(11);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalCount).toBe(11);
    });

    it('should return assets with all queries and in page 2 with multiple states and multiple categories and multiple assets', async () => {
      const dto: AssetPageOptions = {
        take: 10,
        skip: 10,
        sortField: 'assetCode',
        sortOrder: Order.ASC,
        categoryIds: [1, 2],
        states: [AssetState.ASSIGNED, AssetState.AVAILABLE],
      };

      (prismaService.category.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      (prismaService.asset.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          assetCode: 'LA100001',
          name: 'Laptop HP Probook 450 G1',
          state: AssetState.ASSIGNED,
          category: { id: 1, name: 'Laptop' },
        },
        {
          id: 2,
          assetCode: 'MO100001',
          name: 'Monitor Dell UltraSharp',
          state: AssetState.AVAILABLE,
          category: { id: 2, name: 'Monitor' },
        },
      ]);
      (prismaService.asset.count as jest.Mock).mockResolvedValue(11);

      const result = await assetService.getAssets(location, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalCount).toBe(11);
    });
  });
});

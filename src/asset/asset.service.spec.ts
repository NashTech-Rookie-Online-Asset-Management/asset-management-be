import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountType, AssetState, Location, UserStatus } from '@prisma/client';
import { ERROR_MESSAGES, Messages, Order } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetService } from './asset.service';
import { AssetPageOptions, CreateAssetDto, UpdateAssetDto } from './dto';
import { UserType } from 'src/users/types';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

describe('AssetService', () => {
  let assetService: AssetService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            asset: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    assetService = module.get<AssetService>(AssetService);
    prismaService = module.get<PrismaService>(PrismaService);
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
        ERROR_MESSAGES.ASSET_INVALID_LOCATION,
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
        ERROR_MESSAGES.ASSET_INVALID_LOCATION,
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
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_INVALID_LOCATION);
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
        ERROR_MESSAGES.ASSET_CATEGORY_NOT_FOUND,
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

  describe('getAsset', () => {
    const location = Location.HCM;
    const existingAssetId = 1;
    const nonExistingAssetId = 999;

    it('should throw NotFoundException if asset location is null', async () => {
      const location = null;
      const assetMock = {
        id: existingAssetId,
        assetCode: 'LA100001',
        name: 'Laptop HP Probook 450 G1',
        category: { id: 1, name: 'Laptop' },
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HCM,
        specification: 'Core i5, 8GB RAM, 750 GB HDD, Windows 8',
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      await expect(
        assetService.getAsset(location, existingAssetId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        assetService.getAsset(location, existingAssetId),
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_INVALID_LOCATION);
    });

    it('should throw ForbiddenException if asset location is undefined', async () => {
      const location = undefined;
      const assetMock = {
        id: existingAssetId,
        assetCode: 'LA100001',
        name: 'Laptop HP Probook 450 G1',
        category: { id: 1, name: 'Laptop' },
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HCM,
        specification: 'Core i5, 8GB RAM, 750 GB HDD, Windows 8',
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      await expect(
        assetService.getAsset(location, existingAssetId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        assetService.getAsset(location, existingAssetId),
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_INVALID_LOCATION);
    });

    it('should throw BadRequestException if location is invalid', async () => {
      const location = 'ABC';
      const assetMock = {
        id: existingAssetId,
        assetCode: 'LA100001',
        name: 'Laptop HP Probook 450 G1',
        category: { id: 1, name: 'Laptop' },
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HCM,
        specification: 'Core i5, 8GB RAM, 750 GB HDD, Windows 8',
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      await expect(
        assetService.getAsset(location as Location, existingAssetId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        assetService.getAsset(location as Location, existingAssetId),
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_INVALID_LOCATION);
    });

    it('should throw ForbiddenException if location does not match', async () => {
      const assetMock = {
        id: existingAssetId,
        assetCode: 'LA100001',
        name: 'Laptop HP Probook 450 G1',
        category: { id: 1, name: 'Laptop' },
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HN,
        specification: 'Core i5, 8GB RAM, 750 GB HDD, Windows 8',
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      await expect(
        assetService.getAsset(location, existingAssetId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        assetService.getAsset(location, existingAssetId),
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_ACCESS_DENIED);
    });

    it('should return the asset if found and location matches', async () => {
      const assetMock = {
        id: existingAssetId,
        assetCode: 'LA100001',
        name: 'Laptop HP Probook 450 G1',
        category: { id: 1, name: 'Laptop' },
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HCM,
        specification: 'Core i5, 8GB RAM, 750 GB HDD, Windows 8',
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      const result = await assetService.getAsset(location, existingAssetId);

      expect(result).toEqual(assetMock);
    });

    it('should throw NotFoundException if asset is not found', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        assetService.getAsset(location, nonExistingAssetId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        assetService.getAsset(location, nonExistingAssetId),
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_NOT_FOUND);
    });
  });

  describe('create', () => {
    const location = Location.HCM;
    const createAssetDto: CreateAssetDto = {
      name: 'Laptop HP Probook 450 G1',
      categoryId: 1,
      specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
      installedDate: new Date(),
      state: 'AVAILABLE',
    };

    it('should throw BadRequestException if location is null', async () => {
      await expect(assetService.create(null, createAssetDto)).rejects.toThrow(
        HttpException,
      );
      await expect(assetService.create(null, createAssetDto)).rejects.toThrow(
        ERROR_MESSAGES.ASSET_INVALID_LOCATION,
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

  describe('updateAsset', () => {
    const location = Location.HCM;
    const existingAssetId = 1;
    const nonExistingAssetId = 999;
    const updateDtoFailed: UpdateAssetDto = {
      name: 'Updated Asset Name',
      state: AssetState.ASSIGNED,
    };
    const updateDto: UpdateAssetDto = {
      name: 'Updated Asset Name',
      state: AssetState.AVAILABLE,
    };

    it('should throw NotFoundException if asset does not exist', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        assetService.update(adminMockup, nonExistingAssetId, updateDtoFailed),
      ).rejects.toThrow(HttpException);
      await expect(
        assetService.update(adminMockup, nonExistingAssetId, updateDtoFailed),
      ).rejects.toThrow(ERROR_MESSAGES.ASSET_NOT_FOUND);
    });

    it('should update the asset successfully', async () => {
      const assetMock = {
        id: existingAssetId,
        location: location,
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );
      (prismaService.asset.update as jest.Mock).mockResolvedValue({
        ...assetMock,
        ...updateDto,
      });

      const result = await assetService.update(
        adminMockup,
        existingAssetId,
        updateDto,
      );

      expect(result).toEqual({
        ...assetMock,
        ...updateDto,
      });
      expect(prismaService.asset.update).toHaveBeenCalledWith({
        where: { id: existingAssetId },
        data: updateDto,
      });
    });
  });
});

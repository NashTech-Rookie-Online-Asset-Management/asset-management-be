import { AssetState, Location } from '@prisma/client';
import {
  assetService,
  prismaService,
  setupTestModule,
} from './config/test-setup';
import { Messages } from 'src/common/constants';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('AssetService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
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
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
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
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
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
      ).rejects.toThrow(Messages.ASSET.FAILED.ACCESS_DENIED);
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
      ).rejects.toThrow(Messages.ASSET.FAILED.NOT_FOUND);
    });
  });
});

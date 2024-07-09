import { Messages } from 'src/common/constants';
import {
  assetService,
  prismaService,
  setupTestModule,
} from './config/test-setup';
import {
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Location } from '@prisma/client';

describe('AssetService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('delete', () => {
    const location = Location.HCM;
    const existingAssetId = 1;
    const nonExistingAssetId = 999;

    it('should throw BadRequestException if location is null', async () => {
      await expect(assetService.delete(null, existingAssetId)).rejects.toThrow(
        HttpException,
      );
      await expect(assetService.delete(null, existingAssetId)).rejects.toThrow(
        Messages.ASSET.FAILED.INVALID_LOCATION,
      );
    });

    it('should throw BadRequestException if location is undefined', async () => {
      await expect(
        assetService.delete(undefined, existingAssetId),
      ).rejects.toThrow(HttpException);
      await expect(
        assetService.delete(undefined, existingAssetId),
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
    });

    it('should throw BadRequestException if location is invalid', async () => {
      await expect(
        assetService.delete('ABC' as Location, existingAssetId),
      ).rejects.toThrow(HttpException);
      await expect(
        assetService.delete('ABC' as Location, existingAssetId),
      ).rejects.toThrow(Messages.ASSET.FAILED.INVALID_LOCATION);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        assetService.delete(location, nonExistingAssetId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        assetService.delete(location, nonExistingAssetId),
      ).rejects.toThrow(Messages.ASSET.FAILED.NOT_FOUND);
    });

    it('should throw ForbiddenException if location does not match', async () => {
      const assetMock = {
        id: existingAssetId,
        location: Location.HN,
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      await expect(
        assetService.delete(location, existingAssetId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        assetService.delete(location, existingAssetId),
      ).rejects.toThrow(Messages.ASSET.FAILED.ACCESS_DENIED);
    });

    it('should throw ConflictException if asset has assignments', async () => {
      const assetMock = {
        id: existingAssetId,
        location: location,
        assignments: [{ id: 1 }],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      await expect(
        assetService.delete(location, existingAssetId),
      ).rejects.toThrow(ConflictException);
      await expect(
        assetService.delete(location, existingAssetId),
      ).rejects.toThrow(Messages.ASSET.FAILED.DELETE_DENIED);
    });

    it('should delete the asset successfully', async () => {
      const assetMock = {
        id: existingAssetId,
        location: location,
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );
      (prismaService.asset.delete as jest.Mock).mockResolvedValue({});
      (prismaService.asset.findFirst as jest.Mock).mockResolvedValue(null);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      const assetMock = {
        id: existingAssetId,
        location: location,
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );
      (prismaService.asset.delete as jest.Mock).mockRejectedValue(
        new Error('Deletion error'),
      );

      await expect(
        assetService.delete(location, existingAssetId),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        assetService.delete(location, existingAssetId),
      ).rejects.toThrow('Deletion error');
    });

    it('should delete the asset successfully and return a success message', async () => {
      const assetMock = {
        id: existingAssetId,
        location: location,
        assignments: [],
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );
      (prismaService.asset.delete as jest.Mock).mockResolvedValue({});

      const result = await assetService.delete(location, existingAssetId);

      expect(result).toEqual({
        message: Messages.ASSET.SUCCESS.DELETED,
      });
    });
  });
});

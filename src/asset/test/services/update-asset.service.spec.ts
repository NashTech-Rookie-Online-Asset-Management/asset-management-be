import { HttpException } from '@nestjs/common';
import { adminMockup } from './config/mock-data';
import {
  assetService,
  prismaService,
  setupTestModule,
} from './config/test-setup';
import { Messages } from 'src/common/constants';
import { AssetState, Location } from '@prisma/client';
import { UpdateAssetDto } from 'src/asset/dto';

describe('AssetService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      ).rejects.toThrow(Messages.ASSET.FAILED.NOT_FOUND);
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
        select: {
          id: true,
          assetCode: true,
          name: true,
          specification: true,
          state: true,
          category: {
            select: {
              name: true,
              prefix: true,
            },
          },
        },
      });
    });
  });
});

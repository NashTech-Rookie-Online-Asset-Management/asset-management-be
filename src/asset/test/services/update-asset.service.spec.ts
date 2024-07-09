import { ConflictException, HttpException } from '@nestjs/common';
import { adminMockup, assetMock, updateAssetDto } from './config/mock-data';
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

    // it will throw conflict exception if concurrent update
    it('should throw conflict exception if concurrent update', async () => {
      // Mock the initial findUnique call to return the asset
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      // Mock the update call to return the updated asset
      (prismaService.asset.update as jest.Mock).mockResolvedValue({
        ...assetMock,
        ...updateDto,
      });

      // Mock the findFirst call to return a different state of the asset (simulating a concurrent update)
      const concurrentAssetState = { ...assetMock, state: AssetState.ASSIGNED };
      (prismaService.asset.findFirst as jest.Mock).mockResolvedValue(
        concurrentAssetState,
      );

      try {
        await Promise.all([
          assetService.update(adminMockup, 1, updateAssetDto),
          assetService.update(adminMockup, 1, updateAssetDto),
          assetService.update(adminMockup, 1, updateAssetDto),
          assetService.update(adminMockup, 1, updateAssetDto),
        ]);
        fail('Should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(Messages.ASSET.FAILED.CONCURRENT_UPDATE);
      }
    });

    it('Should not edit asset if different version is provided', async () => {
      const date_1 = new Date('2021-01-01');
      const date_2 = new Date('2021-01-02');

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue({
        ...assetMock,
        updatedAt: date_2,
      });

      try {
        await Promise.all([
          assetService.update(adminMockup, 1, {
            ...updateAssetDto,
            updatedAt: date_1,
          }),
        ]);
        fail('Should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(Messages.ASSET.FAILED.DATA_EDITED);
      }
    });

    //should throw error if not same location
    it('Should throw error if not same location', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );

      try {
        await assetService.update(
          {
            ...adminMockup,
            location: Location.HN,
          },
          1,
          updateAssetDto,
        );
        fail('Should not reach here');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          Messages.ASSET.FAILED.UPDATE_NOT_SAME_LOCATION,
        );
      }
    });

    it('should throw error if asset state is assigned', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue({
        ...assetMock,
        state: AssetState.ASSIGNED,
      });
      try {
        await assetService.update(adminMockup, 1, updateAssetDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(Messages.ASSET.FAILED.ASSET_IS_ASSIGNED);
      }
    });

    it('should throw error if update asset state is assigned', async () => {
      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue({
        ...assetMock,
      });
      try {
        await assetService.update(adminMockup, 1, {
          ...updateAssetDto,
          state: AssetState.ASSIGNED,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(Messages.ASSET.FAILED.ASSET_STATE_INVALID);
      }
    });
  });
});

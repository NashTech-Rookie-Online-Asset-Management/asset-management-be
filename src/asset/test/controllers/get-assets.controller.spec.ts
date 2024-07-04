import { AssetState, Location } from '@prisma/client';
import { controller, service, setupTestController } from './config/test-setup';
import { AssetPageOptions } from 'src/asset/dto';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getAssets', () => {
    it('should call assetService.getAssets with correct parameters', async () => {
      const location: Location = Location.HCM;
      const dto: AssetPageOptions = { page: 1, take: 10, skip: 0 };
      const result = {
        data: [
          {
            id: 1,
            name: 'Asset 1',
            assetCode: 'A00001',
            state: AssetState.AVAILABLE,
            category: {
              id: 1,
              name: 'Category 1',
            },
            assignments: [],
          },
        ],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      jest.spyOn(service, 'getAssets').mockResolvedValue(result);

      expect(await controller.getAssets(location, dto)).toBe(result);
      expect(service.getAssets).toHaveBeenCalledWith(location, dto);
    });
  });
});

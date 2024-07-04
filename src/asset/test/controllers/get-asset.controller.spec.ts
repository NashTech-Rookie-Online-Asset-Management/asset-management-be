import { AssetState, Location } from '@prisma/client';
import { controller, service, setupTestController } from './config/test-setup';
import { location } from './config/mock-data';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getAsset', () => {
    it('should call assetService.getAsset with correct parameters', async () => {
      const id = 1;
      const result = {
        id: 1,
        name: 'Asset 1',
        assetCode: 'A00001',
        specification: 'Spec',
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HCM,
        updatedAt: new Date(),
        category: {
          id: 1,
          name: 'Category 1',
        },
        assignments: [],
      };

      jest.spyOn(service, 'getAsset').mockResolvedValue(result);

      expect(await controller.getAsset(location, id)).toBe(result);
      expect(service.getAsset).toHaveBeenCalledWith(location, id);
    });
  });
});

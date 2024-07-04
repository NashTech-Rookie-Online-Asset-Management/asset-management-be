import { createAssetDto, location, result } from './config/mock-data';
import { controller, service, setupTestController } from './config/test-setup';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('createAsset', () => {
    it('should call assetService.create with correct parameters', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.createAsset(location, createAssetDto)).toBe(
        result,
      );
      expect(service.create).toHaveBeenCalledWith(location, createAssetDto);
    });
  });
});

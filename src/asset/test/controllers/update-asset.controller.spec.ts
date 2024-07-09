import { UpdateAssetDto } from 'src/asset/dto';
import { adminMockup } from './config/mock-data';
import { controller, service, setupTestController } from './config/test-setup';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('updateAsset', () => {
    it('should call assetService.update with correct parameters', async () => {
      const id = 1;
      const dto: UpdateAssetDto = { name: 'Updated Asset' };
      const updateResult = { id, name: 'Updated Asset' };

      (service.update as jest.Mock).mockResolvedValue(updateResult);

      const result = await controller.updateAsset(adminMockup, id, dto);

      expect(service.update).toHaveBeenCalledWith(adminMockup, id, dto);
      expect(result).toEqual(updateResult);
    });
  });
});

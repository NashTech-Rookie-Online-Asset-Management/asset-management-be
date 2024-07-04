import { Location } from '@prisma/client';
import { controller, service, setupTestController } from './config/test-setup';
import { Messages } from 'src/common/constants';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('deleteAsset', () => {
    it('should call assetService.delete with correct parameters', async () => {
      const location: Location = Location.HCM;
      const id = 1;

      jest
        .spyOn(service, 'delete')
        .mockResolvedValue({ message: Messages.ASSET.SUCCESS.DELETED });

      expect(await controller.deleteAsset(location, id)).toEqual({
        message: Messages.ASSET.SUCCESS.DELETED,
      });
      expect(service.delete).toHaveBeenCalledWith(location, id);
    });
  });
});

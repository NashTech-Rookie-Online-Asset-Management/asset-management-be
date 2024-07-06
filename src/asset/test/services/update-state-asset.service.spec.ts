import { AssetState } from '@prisma/client';
import {
  assetService,
  prismaService,
  setupTestModule,
} from './config/test-setup';

describe('AssetService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateState', () => {
    it('should update the state of the asset successfully', async () => {
      const assetMock = {
        assetCode: 'ABC',
        state: AssetState.NOT_AVAILABLE,
      };

      (prismaService.asset.findUnique as jest.Mock).mockResolvedValue(
        assetMock,
      );
      (prismaService.asset.update as jest.Mock).mockResolvedValue({
        ...assetMock,
        state: AssetState.AVAILABLE,
      });

      const result = await assetService.updateState(
        'ABC',
        AssetState.AVAILABLE,
      );

      expect(result.state).toEqual(AssetState.AVAILABLE);
    });
  });
});

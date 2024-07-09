import { AccountType } from '@prisma/client';
import { AssetPaginationDto } from 'src/assignment/assignment.dto';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';
import { createdUser, mockAssetResult } from './config/mock-data';

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should get available asset if user is admin', async () => {
    await setupTestController(AccountType.ADMIN);
    mockAssignmentService.getAvailableAsset.mockResolvedValue(mockAssetResult);
    expect(
      await controller.getAvailableAsset(createdUser, new AssetPaginationDto()),
    ).toBe(mockAssetResult);
    expect(mockAssignmentService.getAvailableAsset).toHaveBeenCalled();
  });

  it('Should not get available asset if user is not admin', async () => {
    await setupTestController(AccountType.STAFF);
    mockAssignmentService.getAvailableAsset.mockResolvedValue(mockAssetResult);

    try {
      await controller.getAvailableAsset(createdUser, new AssetPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableAsset).not.toHaveBeenCalled();
    }
  });

  it('Should not get available asset if user is root', async () => {
    await setupTestController(AccountType.ROOT);
    mockAssignmentService.getAvailableAsset.mockResolvedValue(mockAssetResult);

    try {
      await controller.getAvailableAsset(createdUser, new AssetPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableAsset).not.toHaveBeenCalled();
    }
  });
});

import { AccountType } from '@prisma/client';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';
import { createdUser, mockCreateAssignmentResult } from './config/mock-data';

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('requestReturn', () => {
    it('Should request return if user is admin', async () => {
      mockAssignmentService.requestReturn.mockResolvedValue(
        mockCreateAssignmentResult,
      );
      const result = await controller.requestReturn(createdUser, 1);
      expect(result).toBe(mockCreateAssignmentResult);
      expect(mockAssignmentService.requestReturn).toHaveBeenCalled();
    });

    it('Should request return if user is staff', async () => {
      await setupTestController(AccountType.STAFF);
      mockAssignmentService.requestReturn.mockResolvedValue(
        mockCreateAssignmentResult,
      );

      const result = await controller.requestReturn(createdUser, 1);
      expect(result).toBe(mockCreateAssignmentResult);
      expect(mockAssignmentService.requestReturn).toHaveBeenCalled();
    });

    it('Should not request return if user is not admin', async () => {
      await setupTestController(AccountType.ROOT);
      mockAssignmentService.requestReturn.mockResolvedValue(
        mockCreateAssignmentResult,
      );

      try {
        await controller.requestReturn(createdUser, 1);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized');
        expect(mockAssignmentService.requestReturn).not.toHaveBeenCalled();
      }
    });
  });
});

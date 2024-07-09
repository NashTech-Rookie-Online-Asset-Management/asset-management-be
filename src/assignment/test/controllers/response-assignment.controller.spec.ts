import { AccountType } from '@prisma/client';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';
import { adminMockup, mockCreateAssignmentResult } from './config/mock-data';

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('responseAssignment', () => {
    it('Should response assignment if user is admin', async () => {
      await setupTestController(AccountType.ADMIN);
      mockAssignmentService.responseAssignedAssignment.mockResolvedValue(
        mockCreateAssignmentResult,
      );
      const result = await controller.responseAssignment(adminMockup, 1, {
        state: true,
      });
      expect(result).toBe(mockCreateAssignmentResult);
      expect(
        mockAssignmentService.responseAssignedAssignment,
      ).toHaveBeenCalled();
    });
  });
});

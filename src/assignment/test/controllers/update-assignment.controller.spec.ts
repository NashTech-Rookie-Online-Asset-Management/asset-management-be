import { AccountType } from '@prisma/client';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';
import {
  createAssignmentDto,
  createdUser,
  mockCreateAssignmentResult,
} from './config/mock-data';

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should edit assignment if user is admin', async () => {
    await setupTestController(AccountType.ADMIN);
    mockAssignmentService.update.mockResolvedValue(mockCreateAssignmentResult);

    const result = await controller.update(createdUser, 1, createAssignmentDto);
    expect(result).toBe(mockCreateAssignmentResult);
    expect(mockAssignmentService.update).toHaveBeenCalled();
  });

  it('Should not edit assignment if user is not admin', async () => {
    await setupTestController(AccountType.STAFF);
    mockAssignmentService.update.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.update(createdUser, 1, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.update).not.toHaveBeenCalled();
    }
  });

  it('Should not edit assignment if user is root', async () => {
    await setupTestController(AccountType.ROOT);
    mockAssignmentService.update.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.update(createdUser, 1, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.update).not.toHaveBeenCalled();
    }
  });
});

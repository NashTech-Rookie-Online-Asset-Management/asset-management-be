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

  it('Should create assignment if user is admin', async () => {
    mockAssignmentService.create.mockResolvedValue(mockCreateAssignmentResult);

    const result = await controller.create(createdUser, createAssignmentDto);
    expect(result).toBe(mockCreateAssignmentResult);
    expect(mockAssignmentService.create).toHaveBeenCalled();
  });

  it('Should not create assignment if user is not admin', async () => {
    await setupTestController(AccountType.STAFF);
    mockAssignmentService.create.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.create(createdUser, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.create).not.toHaveBeenCalled();
    }
  });

  it('Should not create assignment if user is root', async () => {
    await setupTestController(AccountType.ROOT);
    mockAssignmentService.create.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.create(createdUser, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.create).not.toHaveBeenCalled();
    }
  });
});

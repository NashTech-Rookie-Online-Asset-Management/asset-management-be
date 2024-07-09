import { AccountType } from '@prisma/client';
import { UserPaginationDto } from 'src/assignment/assignment.dto';
import { createdUser, mockUserResult } from './config/mock-data';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should get available user if user is admin', async () => {
    mockAssignmentService.getAvailableUser.mockResolvedValue(mockUserResult);
    expect(
      await controller.getAvailableUser(createdUser, new UserPaginationDto()),
    ).toBe(mockUserResult);
    expect(mockAssignmentService.getAvailableUser).toHaveBeenCalled();
  });

  it('Should not get available user if user is staff', async () => {
    await setupTestController(AccountType.STAFF);
    mockAssignmentService.getAvailableUser.mockResolvedValue(mockUserResult);

    try {
      await controller.getAvailableUser(createdUser, new UserPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableUser).not.toHaveBeenCalled();
    }
  });

  it('Should not get available user if user is root', async () => {
    await setupTestController(AccountType.ROOT);
    mockAssignmentService.getAvailableUser.mockResolvedValue(mockUserResult);

    try {
      await controller.getAvailableUser(createdUser, new UserPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableUser).not.toHaveBeenCalled();
    }
  });
});

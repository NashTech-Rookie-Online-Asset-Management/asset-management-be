import { Account, AccountType, Gender, Location } from '@prisma/client';
import { AssignmentPaginationDto } from 'src/assignment/assignment.dto';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';

const createdUser: Account = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  gender: Gender.MALE,
  location: Location.HCM,
  password: '123456',
  staffCode: 'ST001',
  type: AccountType.ADMIN,
  createdAt: new Date(),
  updatedAt: new Date(),
  joinedAt: new Date(),
  dob: new Date(),
  username: 'johndoe',
  status: 'ACTIVE',
};

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should get list assignment', async () => {
    await setupTestController(AccountType.ADMIN);
    const mockResult = [{ id: 1 }, { id: 2 }];
    mockAssignmentService.getAll.mockResolvedValue(mockResult);
    expect(
      await controller.getAll(createdUser, new AssignmentPaginationDto()),
    ).toBe(mockResult);
    expect(mockAssignmentService.getAll).toHaveBeenCalled();
  });

  it('Shoud get assignment', async () => {
    await setupTestController(AccountType.ADMIN);
    const mockResult = { id: 1 };
    mockAssignmentService.getOne.mockResolvedValue(mockResult);
    expect(await controller.getOne(createdUser, mockResult.id)).toBe(
      mockResult,
    );
    expect(mockAssignmentService.getOne).toHaveBeenCalled();
  });
});

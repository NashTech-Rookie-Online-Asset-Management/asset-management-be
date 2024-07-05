import { Location } from '@prisma/client';
import { UserPaginationDto } from 'src/assignment/assignment.dto';
import { createdUser } from './config/mock-data';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import { plainToInstance } from 'class-transformer';

const mockValue = [
  { id: 1, name: 'John Doe', location: Location.HCM },
  { id: 2, name: 'Jane Doe', location: Location.HCM },
];

const mockResult = {
  pagination: {
    totalCount: 2,
    totalPages: 1,
  },
  data: mockValue,
};

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  beforeEach(() => {
    (mockPrisma.account.findMany as jest.Mock).mockResolvedValueOnce(mockValue);
    (mockPrisma.account.count as jest.Mock).mockResolvedValueOnce(2);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should list all available users', async () => {
    const result = await service.getAvailableUser(
      createdUser,
      new UserPaginationDto(),
    );
    expect(result).toEqual(mockResult);
  });

  it('Should list all available users and exclude the user in the pagination dto', async () => {
    const dto = plainToInstance(UserPaginationDto, {
      assignmentId: 1,
    });
    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(2);
    const result = await service.getAvailableUser(createdUser, dto);
    expect(result).toEqual(mockResult);
  });
});

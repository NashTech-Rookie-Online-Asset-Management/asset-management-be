import { Location } from '@prisma/client';
import { UserPaginationDto } from 'src/assignment/assignment.dto';
import { createdUser } from './config/mock-data';
import { mockPrisma, service, setupTestModule } from './config/test-setup';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should list all available users', async () => {
    const mockValue = [
      { id: 1, name: 'John Doe', location: Location.HCM },
      { id: 2, name: 'Jane Doe', location: Location.HCM },
    ];

    (mockPrisma.account.findMany as jest.Mock).mockResolvedValueOnce(mockValue);
    (mockPrisma.account.count as jest.Mock).mockResolvedValueOnce(2);

    const result = await service.getAvailableUser(
      createdUser,
      new UserPaginationDto(),
    );
    expect(result).toEqual({
      pagination: {
        totalCount: 2,
        totalPages: 1,
      },
      data: mockValue,
    });
  });
});

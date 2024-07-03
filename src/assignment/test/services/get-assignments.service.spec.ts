import { AssignmentPaginationDto } from 'src/assignment/assignment.dto';
import { Messages } from 'src/common/constants';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import { createdUser } from './config/mock-data';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should list all assignment', async () => {
    const mockValue = [{ id: 1 }, { id: 2 }];

    (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce(
      mockValue,
    );
    (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(2);

    const result = await service.getAll(
      createdUser,
      new AssignmentPaginationDto(),
    );
    expect(result).toEqual({
      pagination: {
        totalCount: 2,
        totalPages: 1,
      },
      data: mockValue,
    });
  });

  it('Should get one assignment', async () => {
    const mockValue = { id: 1 };

    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      mockValue,
    );

    const result = await service.getOne(createdUser, 1);
    expect(result).toEqual(mockValue);
  });

  it('Shoud throw error if assignment not found', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.getOne(createdUser, 1);
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toEqual(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }
  });
});

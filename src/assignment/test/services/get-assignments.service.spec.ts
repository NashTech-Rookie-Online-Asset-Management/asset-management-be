import { AssignmentPaginationDto } from 'src/assignment/assignment.dto';
import { Messages } from 'src/common/constants';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import { createdUser } from './config/mock-data';
import { AccountType } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { AssignmentSortKey } from 'src/assignment/assignment.dto';
import { plainToInstance } from 'class-transformer';

const mockAssignments = [{ id: 1 }, { id: 2 }];
const mockResult = {
  data: mockAssignments,
  pagination: { totalCount: 2, totalPages: 1 },
};

const createDtoWithSortKey = (sortField: AssignmentSortKey) =>
  plainToInstance(AssignmentPaginationDto, {
    sortField,
  });

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  beforeEach(() => {
    (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce(
      mockAssignments,
    );
    (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(2);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should assignments with default pagination', async () => {
    const result = await service.getAll(
      createdUser,
      new AssignmentPaginationDto(),
    );
    expect(result).toEqual(mockResult);
  });

  it('Should get assignments with asset code sort key', async () => {
    const dto = createDtoWithSortKey(AssignmentSortKey.ASSET_CODE);
    const result = await service.getAll(createdUser, dto);
    expect(result).toEqual(mockResult);
  });

  it('Should get assignments with asset name sort key', async () => {
    const dto = createDtoWithSortKey(AssignmentSortKey.ASSET_NAME);
    const result = await service.getAll(createdUser, dto);
    expect(result).toEqual(mockResult);
  });

  it('Should get assignments with assigned to sort key', async () => {
    const dto = createDtoWithSortKey(AssignmentSortKey.ASSIGNED_TO);
    const result = await service.getAll(createdUser, dto);
    expect(result).toEqual(mockResult);
  });

  it('Should get assignments with assigned by sort key', async () => {
    const dto = createDtoWithSortKey(AssignmentSortKey.ASSIGNED_BY);
    const result = await service.getAll(createdUser, dto);
    expect(result).toEqual(mockResult);
  });

  it('Should get assignments with assigned date filter', async () => {
    const dto = plainToInstance(AssignmentPaginationDto, {
      date: '2021-01-01',
    });
    const result = await service.getAll(createdUser, dto);
    expect(result).toEqual(mockResult);
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

  it('Should throw error if user trying to get assignment is staff and assignment is not assigned to him/her', async () => {
    const user = { ...createdUser, type: AccountType.STAFF };
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce({
      assignedTo: {
        staffCode: 'STF-001',
      },
    });

    try {
      await service.getOne(user, 1);
      fail('Should throw error');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.NOT_YOUR);
    }
  });
});

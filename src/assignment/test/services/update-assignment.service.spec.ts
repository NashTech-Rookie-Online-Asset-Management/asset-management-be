import {
  AccountType,
  AssetState,
  AssignmentState,
  Location,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import { HttpException, ConflictException } from '@nestjs/common';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import {
  assignedUser,
  assignment,
  assignmentDto,
  createdUser,
  updatedAssignedAsset,
} from './config/mock-data';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should not edit assignment if assignment is not found', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }
  });

  it('Should not edit assignment if assignment is in accepted state', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce({
      ...assignment,
      state: AssignmentState.ACCEPTED,
    });

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_ALREADY_CLOSED,
      );
    }
  });

  it('Should not edit assignment if assignment is in requesting state', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce({
      ...assignment,
      state: AssignmentState.IS_REQUESTED,
    });

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_ALREADY_CLOSED,
      );
    }
  });

  it('Should not edit assignment if updated assigned user is not found', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }
  });

  it('Should not edit assignment if updated assigned user is root user', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      type: AccountType.ROOT,
    });

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_IS_ROOT);
    }
  });

  it('Should not edit assignment if updated asset is not found', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.ASSET_NOT_FOUND);
    }
  });

  it("Should not edit assignment if updated asset is dirrent from old and it isn't available", async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...updatedAssignedAsset,
      id: 2,
      state: AssetState.ASSIGNED,
    });

    try {
      await service.update(createdUser, 1, {
        ...assignmentDto,
        assetCode: 'AS002',
      });
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not edit assignment if updated asset is dirrent from old and it is assigned', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...updatedAssignedAsset,
      id: 2,
      state: AssetState.ASSIGNED,
    });

    try {
      await service.update(createdUser, 1, {
        ...assignmentDto,
        assetCode: 'AS002',
      });
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not edit assignment if updated asset is dirrent from old and it is recycled', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...updatedAssignedAsset,
      id: 2,
      state: AssetState.RECYCLED,
    });

    try {
      await service.update(createdUser, 1, {
        ...assignmentDto,
        assetCode: 'AS002',
      });
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not edit assignment if updated asset is dirrent from old and it is waiting for recycling ', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...updatedAssignedAsset,
      id: 2,
      state: AssetState.WAITING_FOR_RECYCLING,
    });

    try {
      await service.update(createdUser, 1, {
        ...assignmentDto,
        assetCode: 'AS002',
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not edit assignment if updated user is the same', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      id: 1,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      updatedAssignedAsset,
    );

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_THE_SAME);
    }
  });

  it('Should not edit assignment if updated user is disabled', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      status: 'DISABLED',
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      updatedAssignedAsset,
    );

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_DISABLED);
    }
  });

  it('Should not edit assignment if updated user is not in the same location', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      location: Location.DN,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      updatedAssignedAsset,
    );

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    }
  });

  it('Should not edit assignment if updated asset is not in the same location', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...updatedAssignedAsset,
      location: Location.DN,
    });

    try {
      await service.update(createdUser, 1, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_IN_SAME_LOCATION,
      );
    }
  });

  it('Should not edit assignment if updated date is in the past', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      updatedAssignedAsset,
    );

    try {
      await service.update(createdUser, 1, {
        ...assignmentDto,
        assignedDate: new Date('2021-01-01').toLocaleString(),
      });
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.DATE_IN_THE_PAST);
    }
  });

  it('Should edit assignment', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      updatedAssignedAsset,
    );

    (mockPrisma.assignment.update as jest.Mock).mockResolvedValueOnce(
      assignmentDto,
    );

    expect(await service.update(createdUser, 1, assignmentDto)).toEqual(
      assignmentDto,
    );
  });

  it('Should not edit assignment if assignment is editting', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValue(
      assignment,
    );

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValue(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValue(
      updatedAssignedAsset,
    );

    (mockPrisma.assignment.update as jest.Mock).mockResolvedValue(
      assignmentDto,
    );

    try {
      await Promise.all([
        service.update(createdUser, 1, assignmentDto),
        service.update(createdUser, 1, assignmentDto),
        service.update(createdUser, 1, assignmentDto),
        service.update(createdUser, 1, assignmentDto),
      ]);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.CONCURRENT_UPDATE);
    }
  });

  it('Should not edit assignment if assignment is editted before by another user', async () => {
    const date_1 = new Date('2021-01-01');
    const date_2 = new Date('2021-01-02');

    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValue({
      ...assignment,
      updatedAt: date_2,
    });

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValue(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValue(
      updatedAssignedAsset,
    );

    (mockPrisma.assignment.update as jest.Mock).mockResolvedValue(
      assignmentDto,
    );

    try {
      await service.update(createdUser, 1, {
        ...assignmentDto,
        updatedAt: date_1,
      });
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.status).toBe(400);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.DATA_EDITED);
    }
  });
});

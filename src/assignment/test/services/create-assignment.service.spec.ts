import { BadRequestException } from '@nestjs/common';
import { AccountType, AssetState, Location } from '@prisma/client';
import { Messages } from 'src/common/constants';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import {
  assignedAsset,
  assignedUser,
  assignmentDto,
  createdUser,
} from './config/mock-data';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should not create assignment if create user is not found', async () => {
    try {
      await service.create(null, assignmentDto);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }
  });

  it('Should not create assignment if assign user is not found', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }
  });

  it('Should not create assignment if asset is not found', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.ASSET_NOT_FOUND);
    }
  });

  it('Should not create assignemnt if assigned user is root user', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      type: AccountType.ROOT,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedAsset,
    );

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_IS_ROOT);
    }
  });

  it('Should not create assignment if asset is assgined', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedAsset,
      state: AssetState.ASSIGNED,
    });

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment if asset is unavailable', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedAsset,
      state: AssetState.NOT_AVAILABLE,
    });

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment if asset is recycled', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedAsset,
      state: AssetState.RECYCLED,
    });

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment if asset is wating for recycling', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedAsset,
      state: AssetState.WAITING_FOR_RECYCLING,
    });

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment to yourself', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      createdUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedAsset,
    );

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_THE_SAME);
    }
  });

  it('Should not create assignment if assigned user is disable', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      status: 'DISABLED',
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedAsset,
    );

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_DISABLED);
    }
  });

  it('Should not create assignment if user is not in the same location', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedUser,
      location: Location.DN,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedAsset,
    );

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    }
  });

  it('Should not create assignment if asset is not in the same location', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      ...assignedAsset,
      location: Location.DN,
    });

    try {
      await service.create(createdUser, assignmentDto);
      fail('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_IN_SAME_LOCATION,
      );
    }
  });

  it('Should not create assignment if assignment date is in the past', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedAsset,
    );

    try {
      await service.create(createdUser, {
        ...assignmentDto,
        assignedDate: new Date('2021-01-01').toLocaleString(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.DATE_IN_THE_PAST);
    }
  });

  it('Should create assignment', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedUser,
    );

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(
      assignedAsset,
    );

    (mockPrisma.assignment.create as jest.Mock).mockResolvedValueOnce(
      assignmentDto,
    );

    expect(await service.create(createdUser, assignmentDto)).toEqual(
      assignmentDto,
    );
  });
});

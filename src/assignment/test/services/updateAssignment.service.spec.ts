import { Test, TestingModule } from '@nestjs/testing';
import {
  Account,
  AccountType,
  AssetState,
  AssignmentState,
  Gender,
  Location,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { BadRequestException } from '@nestjs/common';

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

const assignmentDto = {
  assetCode: 'AS001',
  staffCode: 'ST001',
  assignedDate: new Date().toLocaleString(),
  note: null,
};

const updatedAssignedAsset = {
  id: 2,
  name: 'Laptop 2',
  state: AssetState.AVAILABLE,
  location: Location.HCM,
};

const assignedUser: Account = {
  id: 2,
  firstName: 'Jane',
  lastName: 'Doe',
  fullName: 'Jane Doe',
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

const assignment = {
  id: 1,
  assetId: 1,
  assignedById: 1,
  assignedToId: 2,
  note: null,
  state: AssignmentState.WAITING_FOR_ACCEPTANCE,
  assignedDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),

  asset: {
    assetCode: 'AS001',
  },
  assignedTo: {
    location: Location.DN,
  },
};

describe('Assignment Service', () => {
  let service: AssignmentService;
  let mockPrisma: PrismaService;

  const mockAssetService = {
    updateState: jest.fn(),
  };

  beforeAll(async () => {
    mockPrisma = {
      account: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      asset: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      assignment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AssetService,
          useValue: mockAssetService,
        },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
      expect(error).toBeInstanceOf(BadRequestException);
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
});

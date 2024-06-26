import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Account,
  AccountType,
  AssetState,
  Gender,
  Location,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignmentService } from './assignment.service';

const createdUser: Account = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
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

describe('Assignment Service', () => {
  let service: AssignmentService;
  let mockPrisma: PrismaService;

  beforeAll(async () => {
    mockPrisma = {
      account: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      asset: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      assignment: {
        create: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should list all available users', async () => {
    (mockPrisma.account.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 1, name: 'John Doe', location: Location.HCM },
      { id: 2, name: 'Jane Doe', location: Location.HCM },
    ]);

    const result = await service.getAvailableUser(createdUser);
    expect(result).toEqual([
      { id: 1, name: 'John Doe', location: Location.HCM },
      { id: 2, name: 'Jane Doe', location: Location.HCM },
    ]);
  });

  it('Should list all available assets', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 0,
      location: Location.HCM,
    });

    (mockPrisma.asset.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 1, name: 'Laptop', location: Location.HCM },
      { id: 2, name: 'Monitor', location: Location.HCM },
    ]);

    const result = await service.getAvailableAsset(createdUser);
    expect(result).toEqual([
      { id: 1, name: 'Laptop', location: Location.HCM },
      { id: 2, name: 'Monitor', location: Location.HCM },
    ]);
  });

  it('Should not create assignment if create user is not found', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(null);

    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }
  });

  it('Should not create assignment if assign user is not found', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(null);

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }
  });

  it('Should not create assignment if asset is not found', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.ASSET_NOT_FOUND);
    }
  });

  it('Should not create assignemnt if assigned user is root user', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
      type: AccountType.ROOT,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_IS_ROOT);
    }
  });

  it('Should not create assignment if asset is assgined', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.ASSIGNED,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment if asset is not available', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.NOT_AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment if asset is recycled', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.RECYCLED,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment if asset is wating for recycling', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.WAITING_FOR_RECYCLING,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }
  });

  it('Should not create assignment to yourself', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.USER_NOT_THE_SAME);
    }
  });

  it('Should not create assignment if user is not in the same location', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.DN,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    }
  });

  it('Should not create assignment if asset is not in the same location', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.DN,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_IN_SAME_LOCATION,
      );
    }
  });

  it('Should not create assignment if assignment date is in the past', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    try {
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date('2021-01-01').toLocaleString(),
        note: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(Messages.ASSIGNMENT.FAILED.DATE_IN_THE_PAST);
    }
  });

  it('Should create assignment', async () => {
    (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 2,
      location: Location.HCM,
    });

    (mockPrisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      state: AssetState.AVAILABLE,
      location: Location.HCM,
    });

    (mockPrisma.assignment.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      assetCode: 'AS001',
      staffCode: 'ST001',
      assignedDate: new Date().toLocaleString(),
      note: null,
    });

    expect(
      await service.create(createdUser, {
        assetCode: 'AS001',
        staffCode: 'ST001',
        assignedDate: new Date().toLocaleString(),
        note: null,
      }),
    ).toEqual({
      id: 1,
      assetCode: 'AS001',
      staffCode: 'ST001',
      assignedDate: new Date().toLocaleString(),
      note: null,
    });

    // Check that the asset was updated
    const updatedAsset = (mockPrisma.asset.update as jest.Mock).mock.calls[0][0]
      .data;
    expect(updatedAsset).toEqual({
      state: AssetState.ASSIGNED,
    });
  });
});

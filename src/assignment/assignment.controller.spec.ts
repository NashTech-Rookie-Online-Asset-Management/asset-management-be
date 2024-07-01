import { ExecutionContext } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import {
  Account,
  AccountType,
  Gender,
  Location,
  UserStatus,
} from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import {
  AssetPaginationDto,
  AssignmentDto,
  UserPaginationDto,
} from './assignment.dto';
import { AssetService } from 'src/asset/asset.service';
import { UserType } from 'src/users/types';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

const mockUserResult = [
  { id: 1, name: 'John Doe', location: 'Jakarta' },
  { id: 2, name: 'Jane Doe', location: 'Jakarta' },
];

const mockAssetResult = [
  { id: 1, name: 'Asset 1', location: 'Jakarta' },
  { id: 2, name: 'Asset 2', location: 'Jakarta' },
];

const mockCreateAssignmentResult = {
  id: 1,
  userId: 1,
  assetId: 1,
  assignedAt: new Date(),
};

const createAssignmentDto: AssignmentDto = {
  assetCode: 'AS001',
  staffCode: 'ST001',
  assignedDate: new Date().toLocaleString(),
  note: 'Note',
};

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

describe('AssignmetnController', () => {
  let controller: AssignmentController;
  let service: AssignmentService;
  let module: TestingModule;

  const mockAssignmentService = {
    getAvailableUser: jest.fn(),
    getAvailableAsset: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    requestReturn: jest.fn(),
    responseAssignedAssignment: jest.fn(),
  };

  const mockAssetService = {
    updateState: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const createMockRoleGuard = (role: AccountType) => ({
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { role };
      return true;
    }),
  });

  const createTestingModule = async (role: AccountType) => {
    module = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        { provide: AssignmentService, useValue: mockAssignmentService },
        { provide: AssetService, useValue: mockAssetService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(createMockRoleGuard(role))
      .compile();

    controller = module.get<AssignmentController>(AssignmentController);
    service = module.get<AssignmentService>(AssignmentService);
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', async () => {
    await createTestingModule(AccountType.ADMIN);
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('Should get available user if user is admin', async () => {
    await createTestingModule(AccountType.ADMIN);
    mockAssignmentService.getAvailableUser.mockResolvedValue(mockUserResult);
    expect(
      await controller.getAvailableUser(createdUser, new UserPaginationDto()),
    ).toBe(mockUserResult);
    expect(mockAssignmentService.getAvailableUser).toHaveBeenCalled();
  });

  it('Should not get available user if user is staff', async () => {
    await createTestingModule(AccountType.STAFF);
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
    await createTestingModule(AccountType.ROOT);
    mockAssignmentService.getAvailableUser.mockResolvedValue(mockUserResult);

    try {
      await controller.getAvailableUser(createdUser, new UserPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableUser).not.toHaveBeenCalled();
    }
  });

  it('Should get available asset if user is admin', async () => {
    await createTestingModule(AccountType.ADMIN);
    mockAssignmentService.getAvailableAsset.mockResolvedValue(mockAssetResult);
    expect(
      await controller.getAvailableAsset(createdUser, new AssetPaginationDto()),
    ).toBe(mockAssetResult);
    expect(mockAssignmentService.getAvailableAsset).toHaveBeenCalled();
  });

  it('Should not get available asset if user is not admin', async () => {
    await createTestingModule(AccountType.STAFF);
    mockAssignmentService.getAvailableAsset.mockResolvedValue(mockAssetResult);

    try {
      await controller.getAvailableAsset(createdUser, new AssetPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableAsset).not.toHaveBeenCalled();
    }
  });

  it('Should not get available asset if user is root', async () => {
    await createTestingModule(AccountType.ROOT);
    mockAssignmentService.getAvailableAsset.mockResolvedValue(mockAssetResult);

    try {
      await controller.getAvailableAsset(createdUser, new AssetPaginationDto());
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.getAvailableAsset).not.toHaveBeenCalled();
    }
  });

  it('Should create assignment if user is admin', async () => {
    await createTestingModule(AccountType.ADMIN);
    mockAssignmentService.create.mockResolvedValue(mockCreateAssignmentResult);

    const result = await controller.create(createdUser, createAssignmentDto);
    expect(result).toBe(mockCreateAssignmentResult);
    expect(mockAssignmentService.create).toHaveBeenCalled();
  });

  it('Should not create assignment if user is not admin', async () => {
    await createTestingModule(AccountType.STAFF);
    mockAssignmentService.create.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.create(createdUser, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.create).not.toHaveBeenCalled();
    }
  });

  it('Should not create assignment if user is root', async () => {
    await createTestingModule(AccountType.ROOT);
    mockAssignmentService.create.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.create(createdUser, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.create).not.toHaveBeenCalled();
    }
  });

  it('Should edit assignment if user is admin', async () => {
    await createTestingModule(AccountType.ADMIN);
    mockAssignmentService.update.mockResolvedValue(mockCreateAssignmentResult);

    const result = await controller.update(createdUser, 1, createAssignmentDto);
    expect(result).toBe(mockCreateAssignmentResult);
    expect(mockAssignmentService.update).toHaveBeenCalled();
  });

  it('Should not edit assignment if user is not admin', async () => {
    await createTestingModule(AccountType.STAFF);
    mockAssignmentService.update.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.update(createdUser, 1, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.update).not.toHaveBeenCalled();
    }
  });

  it('Should not edit assignment if user is root', async () => {
    await createTestingModule(AccountType.ROOT);
    mockAssignmentService.update.mockResolvedValue(mockCreateAssignmentResult);

    try {
      await controller.update(createdUser, 1, createAssignmentDto);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(mockAssignmentService.update).not.toHaveBeenCalled();
    }
  });

  describe('requestReturn', () => {
    it('Should request return if user is admin', async () => {
      await createTestingModule(AccountType.ADMIN);
      mockAssignmentService.requestReturn.mockResolvedValue(
        mockCreateAssignmentResult,
      );
      const result = await controller.requestReturn(createdUser, 1);
      expect(result).toBe(mockCreateAssignmentResult);
      expect(mockAssignmentService.requestReturn).toHaveBeenCalled();
    });

    it('Should request return if user is staff', async () => {
      await createTestingModule(AccountType.STAFF);
      mockAssignmentService.requestReturn.mockResolvedValue(
        mockCreateAssignmentResult,
      );

      const result = await controller.requestReturn(createdUser, 1);
      expect(result).toBe(mockCreateAssignmentResult);
      expect(mockAssignmentService.requestReturn).toHaveBeenCalled();
    });

    it('Should not request return if user is not admin', async () => {
      await createTestingModule(AccountType.ROOT);
      mockAssignmentService.requestReturn.mockResolvedValue(
        mockCreateAssignmentResult,
      );

      try {
        await controller.requestReturn(createdUser, 1);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized');
        expect(mockAssignmentService.requestReturn).not.toHaveBeenCalled();
      }
    });
  });

  describe('responseAssignment', () => {
    it('Should response assignment if user is admin', async () => {
      await createTestingModule(AccountType.ADMIN);
      mockAssignmentService.responseAssignedAssignment.mockResolvedValue(
        mockCreateAssignmentResult,
      );
      const result = await controller.responseAssignment(adminMockup, 1, {
        state: true,
      });
      expect(result).toBe(mockCreateAssignmentResult);
      expect(
        mockAssignmentService.responseAssignedAssignment,
      ).toHaveBeenCalled();
    });
  });
});

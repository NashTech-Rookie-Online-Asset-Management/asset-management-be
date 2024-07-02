import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Account, AccountType, Gender, Location } from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';
import { AssignmentController } from 'src/assignment/assignment.controller';
import { AssignmentService } from 'src/assignment/assignment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';

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

const mockCreateAssignmentResult = {
  id: 1,
  userId: 1,
  assetId: 1,
  assignedAt: new Date(),
};

describe('AssignmetnController', () => {
  let controller: AssignmentController;
  let module: TestingModule;

  const mockAssignmentService = {
    requestReturn: jest.fn(),
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
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
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
});

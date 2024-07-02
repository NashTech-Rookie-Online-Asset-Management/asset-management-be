import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountType, Location, UserStatus } from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';
import { AssignmentController } from 'src/assignment/assignment.controller';
import { AssignmentService } from 'src/assignment/assignment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserType } from 'src/users/types';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

const mockCreateAssignmentResult = {
  id: 1,
  userId: 1,
  assetId: 1,
  assignedAt: new Date(),
};

describe('AssignmentController', () => {
  let controller: AssignmentController;
  let module: TestingModule;

  const mockAssignmentService = {
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
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
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

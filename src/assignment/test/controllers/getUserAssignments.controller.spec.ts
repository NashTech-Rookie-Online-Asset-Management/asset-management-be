import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AccountType,
  AssignmentState,
  Location,
  UserStatus,
} from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';
import { AssignmentController } from 'src/assignment/assignment.controller';
import { AssignmentService } from 'src/assignment/assignment.service';
import { AssignmentPaginationDto, AssignmentSortKey } from 'src/assignment/dto';
import { Order } from 'src/common/constants';
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

const assignment = {
  id: 1,
  assetId: 1,
  assignedById: 1,
  assignedToId: 1,
  note: null,
  state: AssignmentState.WAITING_FOR_ACCEPTANCE,
  assignedDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  asset: {
    assetCode: 'AS001',
    name: 'Laptop',
    category: 'Electronics',
  },
  assignedBy: {
    staffCode: 'SD0001',
    fullName: 'Admin User',
  },
};

describe('AssignmetnController', () => {
  let controller: AssignmentController;
  let module: TestingModule;

  const mockAssignmentService = {
    getUserAssignments: jest.fn(),
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

  describe('getUserAssignments', () => {
    it('Should get user assignments for admin', async () => {
      await createTestingModule(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      const result = {
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });

    it('Should get user assignments with pagination and sort options', async () => {
      await createTestingModule(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        sortField: AssignmentSortKey.ASSET_NAME,
        sortOrder: Order.ASC,
      };

      const result = {
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });

    it('Should get user assignments with search filter', async () => {
      await createTestingModule(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        search: 'Laptop',
      };

      const result = {
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });

    it('Should return empty assignments if no assignments found', async () => {
      await createTestingModule(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      const result = {
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });
  });
});

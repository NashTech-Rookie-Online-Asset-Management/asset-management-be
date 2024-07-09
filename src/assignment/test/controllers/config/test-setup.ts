import { Test, TestingModule } from '@nestjs/testing';
import { AccountType } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { AssignmentService } from 'src/assignment/assignment.service';
import { AssetService } from 'src/asset/asset.service';
import { Reflector } from '@nestjs/core';
import { AssignmentController } from 'src/assignment/assignment.controller';

export const mockAssignmentService = {
  create: jest.fn(),
  delete: jest.fn(),
  getAvailableAsset: jest.fn(),
  getAvailableUser: jest.fn(),
  getUserAssignments: jest.fn(),
  requestReturn: jest.fn(),
  update: jest.fn(),
  responseAssignedAssignment: jest.fn(),
  getAll: jest.fn(),
  getOne: jest.fn(),
};

export const mockAssetService = {
  updateState: jest.fn(),
};

export const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

export let controller: AssignmentController;
export let service: AssignmentService;
export const createMockRoleGuard = (role: AccountType) => ({
  canActivate: jest.fn((context) => {
    const request = context.switchToHttp().getRequest();
    request.user = { role };
    return true;
  }),
});

export const setupTestController = async (role: AccountType) => {
  const module: TestingModule = await Test.createTestingModule({
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

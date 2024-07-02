import { Test, TestingModule } from '@nestjs/testing';
import {
  Account,
  AccountType,
  AssignmentState,
  Gender,
  Location,
  UserStatus,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import { AssignmentService } from 'src/assignment/assignment.service';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
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

  describe('responseAssignedAssignment', () => {
    const dto = { state: true };

    it('should throw Error if assignment is not found', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND);
    });
    it('Should throw BadRequest when user not same location', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        assignment,
      );

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignedUser,
        location: Location.DN,
      });

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION);
    });
    it('Should throw BadRequest when assignment is not waiting for acceptance', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.ACCEPTED,
        assignedTo: {
          ...assignment.assignedTo,
          location: Location.HCM,
        },
      });

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.NOT_WAITING_FOR_ACCEPTANCE);
    });

    it('Should throw BadRequest when assignment is not yours', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.WAITING_FOR_ACCEPTANCE,
        assignedTo: {
          ...assignment.assignedTo,
          location: Location.HCM,
        },
      });

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignedUser,
        location: Location.HCM,
      });

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.NOT_YOURS);
    });

    it('Should response assignment true', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.WAITING_FOR_ACCEPTANCE,
        assignedTo: {
          ...assignment.assignedTo,
          id: 1,
          location: Location.HCM,
          staffCode: adminMockup.staffCode,
        },
      });

      const updateSpy = jest
        .spyOn(mockPrisma.assignment, 'update')
        .mockResolvedValueOnce(null);

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).resolves.toEqual({ message: Messages.ASSIGNMENT.SUCCESS.ACCEPTED });

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { state: AssignmentState.ACCEPTED },
      });
    });

    it('Should response assignment false', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.WAITING_FOR_ACCEPTANCE,
        assignedTo: {
          ...assignment.assignedTo,
          id: 1,
          location: Location.HCM,
          staffCode: adminMockup.staffCode,
        },
      });

      const updateSpy = jest
        .spyOn(mockPrisma.assignment, 'update')
        .mockResolvedValueOnce(null);

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, { state: false }),
      ).resolves.toEqual({ message: Messages.ASSIGNMENT.SUCCESS.DECLINED });

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { state: AssignmentState.DECLINED },
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  AccountType,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import { Order } from 'src/common/constants';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import { AssignmentService } from 'src/assignment/assignment.service';

import { AssignmentPaginationDto, AssignmentSortKey } from 'src/assignment/dto';

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

  describe('getUserAssignments', () => {
    it('Should return assignments', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      await expect(
        service.getUserAssignments(adminMockup, pagination),
      ).resolves.toEqual({
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      });

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        where: {
          assignedToId: adminMockup.id,
          assignedDate: { lte: expect.any(Date) },
          state: { not: AssignmentState.DECLINED },
          OR: [
            { returningRequest: null },
            { returningRequest: { state: { not: RequestState.COMPLETED } } },
          ],
        },
        orderBy: [],
        skip: pagination.skip,
        take: pagination.take,
        include: {
          assignedBy: {
            select: {
              staffCode: true,
              fullName: true,
            },
          },
          asset: {
            select: {
              assetCode: true,
              name: true,
              category: true,
            },
          },
        },
      });

      expect(mockPrisma.assignment.count).toHaveBeenCalledWith({
        where: {
          assignedToId: adminMockup.id,
          assignedDate: { lte: expect.any(Date) },
          state: { not: AssignmentState.DECLINED },
          OR: [
            { returningRequest: null },
            { returningRequest: { state: { not: RequestState.COMPLETED } } },
          ],
        },
      });
    });

    it('Should handle empty results', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(0);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      await expect(
        service.getUserAssignments(adminMockup, pagination),
      ).resolves.toEqual({
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      });
    });

    it('Should return sorted assignments by asset name', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        sortField: AssignmentSortKey.ASSET_NAME,
        sortOrder: Order.ASC,
      };

      await expect(
        service.getUserAssignments(adminMockup, pagination),
      ).resolves.toEqual({
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      });

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        where: {
          assignedToId: adminMockup.id,
          assignedDate: { lte: expect.any(Date) },
          state: { not: AssignmentState.DECLINED },
          OR: [
            { returningRequest: null },
            { returningRequest: { state: { not: RequestState.COMPLETED } } },
          ],
        },
        orderBy: [{ asset: { name: Order.ASC } }],
        skip: pagination.skip,
        take: pagination.take,
        include: {
          assignedBy: {
            select: {
              staffCode: true,
              fullName: true,
            },
          },
          asset: {
            select: {
              assetCode: true,
              name: true,
              category: true,
            },
          },
        },
      });

      expect(mockPrisma.assignment.count).toHaveBeenCalledWith({
        where: {
          assignedToId: adminMockup.id,
          assignedDate: { lte: expect.any(Date) },
          state: { not: AssignmentState.DECLINED },
          OR: [
            { returningRequest: null },
            { returningRequest: { state: { not: RequestState.COMPLETED } } },
          ],
        },
      });
    });

    it('Should return assignments with search filter', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        search: 'Laptop',
      };

      await expect(
        service.getUserAssignments(adminMockup, pagination),
      ).resolves.toEqual({
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      });

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        where: {
          assignedToId: adminMockup.id,
          assignedDate: { lte: expect.any(Date) },
          state: { not: AssignmentState.DECLINED },
          OR: [
            { returningRequest: null },
            { returningRequest: { state: { not: RequestState.COMPLETED } } },
          ],
          asset: {
            name: {
              contains: 'Laptop',
              mode: 'insensitive',
            },
          },
        },
        orderBy: [],
        skip: pagination.skip,
        take: pagination.take,
        include: {
          assignedBy: {
            select: {
              staffCode: true,
              fullName: true,
            },
          },
          asset: {
            select: {
              assetCode: true,
              name: true,
              category: true,
            },
          },
        },
      });

      expect(mockPrisma.assignment.count).toHaveBeenCalledWith({
        where: {
          assignedToId: adminMockup.id,
          assignedDate: { lte: expect.any(Date) },
          state: { not: AssignmentState.DECLINED },
          OR: [
            { returningRequest: null },
            { returningRequest: { state: { not: RequestState.COMPLETED } } },
          ],
          asset: {
            name: {
              contains: 'Laptop',
              mode: 'insensitive',
            },
          },
        },
      });
    });
  });
});

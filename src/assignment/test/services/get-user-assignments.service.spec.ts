import { AssignmentState, RequestState } from '@prisma/client';
import { Order } from 'src/common/constants';

import { AssignmentPaginationDto, AssignmentSortKey } from 'src/assignment/dto';
import { adminMockup, assignment } from './config/mock-data';
import { mockPrisma, service, setupTestModule } from './config/test-setup';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  const pagination: AssignmentPaginationDto = {
    page: 1,
    take: 10,
    skip: 0,
    sortField: AssignmentSortKey.STATE,
    sortOrder: Order.ASC,
  };
  const condition = {
    where: {
      assignedToId: adminMockup.id,
      assignedDate: { lte: expect.any(Date) },
      state: { not: AssignmentState.DECLINED },
      OR: [
        { returningRequest: null },
        { returningRequest: { state: { not: RequestState.COMPLETED } } },
      ],
    },
    orderBy: [{ state: Order.ASC }],
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
  };
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
    it('Should return sorted assignments by asset code', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        sortField: AssignmentSortKey.ASSET_CODE,
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
        orderBy: [{ asset: { assetCode: Order.ASC } }],
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
    });
    it('Should return sorted assignments by category', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        sortField: AssignmentSortKey.CATEGORY,
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
        orderBy: [{ asset: { category: { name: Order.ASC } } }],
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
    it('Should return sorted assignments by assigned date', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        sortField: AssignmentSortKey.ASSIGNED_DATE,
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
        ...condition,
        orderBy: [{ assignedDate: Order.ASC }],
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
    it('Should return sorted assignments by state', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

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
        ...condition,
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
    it('Should return sorted assignments by default', async () => {
      (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
        assignment,
      ]);
      (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(1);

      await expect(
        service.getUserAssignments(adminMockup, {
          ...pagination,
          skip: 0,
          sortField: undefined,
          sortOrder: undefined,
        }),
      ).resolves.toEqual({
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      });

      expect(mockPrisma.assignment.findMany).toHaveBeenCalledWith({
        ...condition,
        orderBy: [],
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

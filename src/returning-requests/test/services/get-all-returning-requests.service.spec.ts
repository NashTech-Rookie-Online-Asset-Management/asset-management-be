import { BadRequestException } from '@nestjs/common';
import { Location, RequestState } from '@prisma/client';
import { Messages, Order } from 'src/common/constants';
import {
  FindAllReturningRequestsSortKey,
  ReturningRequestPageOptions,
} from 'src/returning-requests/dto';
import { prismaService, service, setupTestModule } from './config/test-setup';

describe('ReturningRequestsService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    const dto: ReturningRequestPageOptions = {
      page: 1,
      take: 10,
      skip: 0,
      states: [RequestState.COMPLETED, RequestState.WAITING_FOR_RETURNING],
      search: '',
      sortField: FindAllReturningRequestsSortKey.ASSET_CODE,
      sortOrder: Order.ASC,
      returnedDate: '2024-06-30',
    };
    const startDate = new Date(dto.returnedDate);
    const endDate = new Date(dto.returnedDate);
    endDate.setDate(endDate.getDate() + 1);

    const conditions = {
      select: {
        id: true,
        assignment: {
          select: {
            asset: {
              select: {
                assetCode: true,
                name: true,
              },
            },
            assignedDate: true,
          },
        },
        requestedBy: {
          select: {
            username: true,
          },
        },
        acceptedBy: {
          select: {
            username: true,
          },
        },
        returnedDate: true,
        state: true,
      },
      take: dto.take,
      skip: (dto.page - 1) * dto.take,
    };

    it('shold throw BadRequestException if location is null', async () => {
      await expect(service.getAll(null, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getAll(null, dto)).rejects.toThrow(
        Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION,
      );
    });

    it('shold throw BadRequestException if location is undefined', async () => {
      await expect(service.getAll(undefined, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getAll(undefined, dto)).rejects.toThrow(
        Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION,
      );
    });

    it('should throw BadRequestException if location is invalid', async () => {
      await expect(
        service.getAll('InvalidLocation' as Location, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getAll('InvalidLocation' as Location, dto),
      ).rejects.toThrow(Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION);
    });

    it('should return empty returning requests and pagination data', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        [],
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getAll(location, dto);

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          returnedDate: {
            gte: startDate,
            lt: endDate,
          },
          state: {
            in: dto.states,
          },
        }),
        orderBy: {
          assignment: {
            asset: {
              assetCode: dto.sortOrder,
            },
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      });
    });

    it('should return empty returning requests and pagination data if skip is greater than total count', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        [],
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getAll(location, {
        ...dto,
        page: 2,
        skip: 10,
      });

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          returnedDate: {
            gte: startDate,
            lt: endDate,
          },
          state: {
            in: dto.states,
          },
        }),
        orderBy: {
          assignment: {
            asset: {
              assetCode: dto.sortOrder,
            },
          },
        },
        select: {
          id: true,
          assignment: {
            select: {
              asset: {
                select: {
                  assetCode: true,
                  name: true,
                },
              },
              assignedDate: true,
            },
          },
          requestedBy: {
            select: {
              username: true,
            },
          },
          acceptedBy: {
            select: {
              username: true,
            },
          },
          returnedDate: true,
          state: true,
        },
        take: dto.take,
        skip: 10,
      });

      expect(result).toEqual({
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      });
    });

    it('should return returning requests and pagination data with search query', async () => {
      const location = Location.HCM;
      const search = 'search';

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, {
        ...dto,
        search,
        skip: 0,
      });

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: {
          returnedDate: {
            gte: startDate,
            lt: endDate,
          },
          state: {
            in: dto.states,
          },
          OR: [
            {
              assignment: {
                asset: {
                  assetCode: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              assignment: {
                asset: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              requestedBy: {
                username: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        orderBy: {
          assignment: {
            asset: {
              assetCode: dto.sortOrder,
            },
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });

    it('should return returning requests and pagination data with order query', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, {
        ...dto,
        sortField: FindAllReturningRequestsSortKey.ASSET_NAME,
        skip: 0,
      });

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: {
          returnedDate: {
            gte: startDate,
            lt: endDate,
          },
          state: {
            in: dto.states,
          },
        },
        orderBy: {
          assignment: {
            asset: {
              name: dto.sortOrder,
            },
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });

    it('should return returning requests with all queries and in page 2', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, dto);

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: {
          returnedDate: {
            gte: startDate,
            lt: endDate,
          },
          state: {
            in: dto.states,
          },
        },
        orderBy: {
          assignment: {
            asset: {
              assetCode: dto.sortOrder,
            },
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });

    it('should return paginated returning requests with valid inputs', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, dto);

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        orderBy: {
          assignment: {
            asset: {
              assetCode: dto.sortOrder,
            },
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });

    it('should return returning requests sorted by assigned date query', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, {
        ...dto,
        sortField: FindAllReturningRequestsSortKey.ASSIGNED_DATE,
        skip: 0,
      });

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        orderBy: {
          assignment: {
            assignedDate: dto.sortOrder,
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });

    it('should return returning requests sorted by accepted by query', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, {
        ...dto,
        sortField: FindAllReturningRequestsSortKey.ACCEPTED_BY,
        skip: 0,
      });

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        orderBy: {
          acceptedBy: {
            username: dto.sortOrder,
          },
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });

    it('should return returning requests sorted by state query', async () => {
      const location = Location.HCM;

      // Mocking PrismaService responses
      const mockReturningRequests = [{ id: 1, location }];
      const mockTotalCount = 1;
      (prismaService.returningRequest.findMany as jest.Mock).mockResolvedValue(
        mockReturningRequests,
      );
      (prismaService.returningRequest.count as jest.Mock).mockResolvedValue(
        mockTotalCount,
      );

      const result = await service.getAll(location, {
        ...dto,
        sortField: FindAllReturningRequestsSortKey.STATE,
        skip: 0,
      });

      expect(prismaService.returningRequest.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        orderBy: {
          state: dto.sortOrder,
        },
        ...conditions,
      });

      expect(result).toEqual({
        data: mockReturningRequests,
        pagination: {
          totalPages: Math.ceil(mockTotalCount / dto.take),
          totalCount: mockTotalCount,
        },
      });
    });
  });
});

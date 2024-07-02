import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AccountType,
  AssetState,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import { Messages, Order } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import {
  FindAllReturningRequestsSortKey,
  ReturningRequestPageOptions,
} from './dto';
import { ReturningRequestsService } from './returning-requests.service';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

describe('ReturningRequestsService', () => {
  let service: ReturningRequestsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturningRequestsService,
        {
          provide: PrismaService,
          useValue: {
            returningRequest: {
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            assignment: {
              update: jest.fn(),
            },
            asset: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReturningRequestsService>(ReturningRequestsService);
    prismaService = module.get<PrismaService>(PrismaService);
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

  describe('toggleReturningRequest', () => {
    const requestId = 1;
    const dto = { state: true };

    const returnRequestMock = {
      id: requestId,
      state: RequestState.WAITING_FOR_RETURNING,
      assignmentId: 1,
      requestedById: 1,
      acceptedById: 1,
      assignment: {
        id: 1,
        state: AssignmentState.ACCEPTED,
        asset: {
          id: 1,
          location: Location.HCM,
        },
      },
    };

    it('should throw NotFoundException if return request is not found', async () => {
      jest
        .spyOn(prismaService.returningRequest, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(
        service.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(Messages.RETURNING_REQUEST.FAILED.NOT_FOUND);
    });

    it('should throw BadRequestException if return request state is invalid', async () => {
      (
        prismaService.returningRequest.findUnique as jest.Mock
      ).mockResolvedValue({
        ...returnRequestMock,
        state: RequestState.COMPLETED,
      });

      await expect(
        service.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(Messages.RETURNING_REQUEST.FAILED.INVALID_STATE);
    });

    it('should throw BadRequestException if admin location is invalid', async () => {
      (
        prismaService.returningRequest.findUnique as jest.Mock
      ).mockResolvedValue({
        ...returnRequestMock,
        assignment: {
          ...returnRequestMock.assignment,
          asset: {
            ...returnRequestMock.assignment.asset,
            location: Location.HN,
          },
        },
      });

      await expect(
        service.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION);
    });

    it('should complete the return request if state is true', async () => {
      (
        prismaService.returningRequest.findUnique as jest.Mock
      ).mockResolvedValue(returnRequestMock);
      jest
        .spyOn(prismaService.returningRequest, 'update')
        .mockResolvedValueOnce(null);
      jest.spyOn(prismaService.asset, 'update').mockResolvedValueOnce(null);

      const result = await service.toggleReturningRequest(
        adminMockup,
        requestId,
        dto,
      );

      expect(prismaService.returningRequest.update).toHaveBeenCalledWith({
        where: { id: requestId },
        data: {
          state: RequestState.COMPLETED,
          returnedDate: expect.any(Date),
          acceptedById: adminMockup.id,
        },
      });

      expect(prismaService.asset.update).toHaveBeenCalledWith({
        where: { id: returnRequestMock.assignment.asset.id },
        data: { state: AssetState.AVAILABLE },
      });

      expect(result).toEqual({
        message: Messages.RETURNING_REQUEST.SUCCESS.CONFIRMED,
      });
    });

    it('should cancel the return request if state is false', async () => {
      const cancelDto = { state: false };
      (
        prismaService.returningRequest.findUnique as jest.Mock
      ).mockResolvedValue(returnRequestMock);
      jest
        .spyOn(prismaService.assignment, 'update')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(prismaService.returningRequest, 'delete')
        .mockResolvedValueOnce(null);

      const result = await service.toggleReturningRequest(
        adminMockup,
        requestId,
        cancelDto,
      );

      expect(prismaService.assignment.update).toHaveBeenCalledWith({
        where: { id: returnRequestMock.assignment.id },
        data: { state: AssignmentState.ACCEPTED },
      });

      expect(prismaService.returningRequest.delete).toHaveBeenCalledWith({
        where: { id: requestId },
      });

      expect(result).toEqual({
        message: Messages.RETURNING_REQUEST.SUCCESS.CANCELLED,
      });
    });
  });
});

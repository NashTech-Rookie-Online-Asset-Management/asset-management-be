import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturningRequestsService } from './returning-requests.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Messages } from 'src/common/constants';
import {
  AccountType,
  AssignmentState,
  RequestState,
  AssetState,
  UserStatus,
  Location,
} from '@prisma/client';
import { UserType } from 'src/users/types';

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

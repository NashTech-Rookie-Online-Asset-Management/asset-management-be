import { BadRequestException, NotFoundException } from '@nestjs/common';
import { adminMockup, returnRequestMock } from './config/mock-data';
import { prismaService, service, setupTestModule } from './config/test-setup';
import { Messages } from 'src/common/constants';
import {
  AssetState,
  AssignmentState,
  Location,
  RequestState,
} from '@prisma/client';

describe('ReturningRequestsService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleReturningRequest', () => {
    const requestId = 1;
    const dto = { state: true };

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

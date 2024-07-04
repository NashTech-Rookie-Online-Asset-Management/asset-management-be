import { ToggleReturnRequestDto } from 'src/returning-requests/dto';
import { controller, service, setupTestController } from './config/test-setup';
import { Messages } from 'src/common/constants';
import { adminMockup } from './config/mock-data';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReturningRequestsController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('toggleReturningRequest', () => {
    const requestId = 1;

    it('should change request state to completed', async () => {
      const dto: ToggleReturnRequestDto = { state: true };
      const resultMessage = {
        message: Messages.RETURNING_REQUEST.SUCCESS.CONFIRMED,
      };

      jest
        .spyOn(service, 'toggleReturningRequest')
        .mockResolvedValueOnce(resultMessage);

      const result = await controller.toggleReturningRequest(
        adminMockup,
        requestId,
        dto,
      );
      expect(result).toEqual(resultMessage);
      expect(service.toggleReturningRequest).toHaveBeenCalledWith(
        adminMockup,
        requestId,
        dto,
      );
    });

    it('should cancel the return request', async () => {
      const dto: ToggleReturnRequestDto = { state: false };
      const resultMessage = {
        message: Messages.RETURNING_REQUEST.SUCCESS.CANCELLED,
      };

      jest
        .spyOn(service, 'toggleReturningRequest')
        .mockResolvedValueOnce(resultMessage);

      const result = await controller.toggleReturningRequest(
        adminMockup,
        requestId,
        dto,
      );
      expect(result).toEqual(resultMessage);
      expect(service.toggleReturningRequest).toHaveBeenCalledWith(
        adminMockup,
        requestId,
        dto,
      );
    });

    it('should handle not found exception', async () => {
      const dto: ToggleReturnRequestDto = { state: true };

      jest
        .spyOn(service, 'toggleReturningRequest')
        .mockRejectedValueOnce(
          new NotFoundException(Messages.RETURNING_REQUEST.FAILED.NOT_FOUND),
        );

      await expect(
        controller.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle bad request exception for invalid state', async () => {
      const dto: ToggleReturnRequestDto = { state: true };

      jest
        .spyOn(service, 'toggleReturningRequest')
        .mockRejectedValueOnce(
          new BadRequestException(
            Messages.RETURNING_REQUEST.FAILED.INVALID_STATE,
          ),
        );

      await expect(
        controller.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle bad request exception for invalid location', async () => {
      const dto: ToggleReturnRequestDto = { state: true };

      jest
        .spyOn(service, 'toggleReturningRequest')
        .mockRejectedValueOnce(
          new BadRequestException(
            Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION,
          ),
        );

      await expect(
        controller.toggleReturningRequest(adminMockup, requestId, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

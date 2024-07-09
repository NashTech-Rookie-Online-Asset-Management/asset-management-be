import {
  FindAllReturningRequestsSortKey,
  ReturningRequestPageOptions,
} from 'src/returning-requests/dto';
import { controller, service, setupTestController } from './config/test-setup';
import { Order } from 'src/common/constants';
import { BadRequestException } from '@nestjs/common';
import { Location } from '@prisma/client';

describe('ReturningRequestsController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    const location = Location.HCM;
    const dto: ReturningRequestPageOptions = {
      take: 10,
      skip: 0,
      sortField: FindAllReturningRequestsSortKey.ID,
      sortOrder: Order.ASC,
    };

    it('should return all returning requests', async () => {
      const expectedResult = {
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      };

      jest.spyOn(service, 'getAll').mockResolvedValueOnce(expectedResult);

      const result = await controller.getAll(location, dto);
      expect(result).toEqual(expectedResult);
      expect(service.getAll).toHaveBeenCalledWith(location, dto);
    });

    it('should handle bad request exception for invalid location', async () => {
      jest
        .spyOn(service, 'getAll')
        .mockRejectedValueOnce(
          new BadRequestException('Invalid location provided'),
        );

      await expect(controller.getAll(location, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

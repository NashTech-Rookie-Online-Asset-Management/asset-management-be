import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountType, Location, UserStatus } from '@prisma/client';
import { Messages, Order } from 'src/common/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserType } from 'src/users/types';
import {
  FindAllReturningRequestsSortKey,
  ReturningRequestPageOptions,
  ToggleReturnRequestDto,
} from './dto';
import { ReturningRequestsController } from './returning-requests.controller';
import { ReturningRequestsService } from './returning-requests.service';

const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

describe('ReturningRequestsController', () => {
  let controller: ReturningRequestsController;
  let service: ReturningRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturningRequestsController],
      providers: [
        {
          provide: ReturningRequestsService,
          useValue: {
            getAll: jest.fn(),
            toggleReturningRequest: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ReturningRequestsController>(
      ReturningRequestsController,
    );
    service = module.get<ReturningRequestsService>(ReturningRequestsService);
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

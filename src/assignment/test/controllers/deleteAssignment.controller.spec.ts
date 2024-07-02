import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Location } from '@prisma/client';
import { AssignmentController } from 'src/assignment/assignment.controller';
import { AssignmentService } from 'src/assignment/assignment.service';
import { Messages } from 'src/common/constants';
import { RolesGuard } from 'src/common/guards/role.guard';

describe('AssignmentController', () => {
  let controller: AssignmentController;

  const mockAssignmentService = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        {
          provide: AssignmentService,
          useValue: mockAssignmentService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AssignmentController>(AssignmentController);
  });

  it('should delete an assignment successfully', async () => {
    mockAssignmentService.delete.mockResolvedValue({
      message: Messages.ASSIGNMENT.SUCCESS.DELETED,
    });
    const result = await controller.delete(Location.HCM, 1);
    expect(result).toEqual({ message: Messages.ASSIGNMENT.SUCCESS.DELETED });
    expect(mockAssignmentService.delete).toHaveBeenCalledWith(Location.HCM, 1);
  });

  it('should throw BadRequestException for invalid location', async () => {
    mockAssignmentService.delete.mockRejectedValue(
      new BadRequestException(Messages.ASSIGNMENT.FAILED.ACCESS_DENIED),
    );
    await expect(
      controller.delete('INVALID_LOCATION' as Location, 1),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if assignment not found', async () => {
    mockAssignmentService.delete.mockRejectedValue(
      new NotFoundException('Assignment not found'),
    );
    await expect(controller.delete(Location.HCM, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if access is denied', async () => {
    mockAssignmentService.delete.mockRejectedValue(
      new ForbiddenException('Access denied'),
    );
    await expect(controller.delete(Location.HCM, 1)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('show throw BadRequestException if assignment state is not WAITING_FOR_ACCEPTANCE or DECLINEC', async () => {
    mockAssignmentService.delete.mockRejectedValue(
      new BadRequestException(Messages.ASSIGNMENT.FAILED.DELETE_DENIED),
    );
    await expect(controller.delete(Location.HCM, 1)).rejects.toThrow(
      BadRequestException,
    );
  });
});

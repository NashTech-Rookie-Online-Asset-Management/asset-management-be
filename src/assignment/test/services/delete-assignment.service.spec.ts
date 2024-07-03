import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentState, Location } from '@prisma/client';
import { Messages } from 'src/common/constants';
import { mockPrisma, service, setupTestModule } from './config/test-setup';

describe('AssignmentService', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should delete an assignment successfully', async () => {
    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      asset: { location: Location.HCM },
      state: AssignmentState.WAITING_FOR_ACCEPTANCE,
    });
    (mockPrisma.assignment.delete as jest.Mock).mockResolvedValue({});

    const result = await service.delete(Location.HCM, 1);
    expect(result).toEqual({ message: Messages.ASSIGNMENT.SUCCESS.DELETED });
  });

  it('Should throw BadRequestException for invalid location', async () => {
    await expect(
      service.delete('INVALID_LOCATION' as Location, 1),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should throw NotFoundException if assignment not found', async () => {
    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.delete(Location.HCM, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should throw ForbiddenException if access is denied', async () => {
    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      asset: { location: Location.HN },
    });
    await expect(service.delete(Location.HCM, 1)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('Should throw BadRequestException if delete is denied', async () => {
    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      asset: { location: Location.HCM },
      state: AssignmentState.ACCEPTED,
    });
    await expect(service.delete(Location.HCM, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('Should throw InternalServerErrorException on delete error', async () => {
    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      asset: { location: Location.HCM },
      state: AssignmentState.WAITING_FOR_ACCEPTANCE,
    });
    (mockPrisma.assignment.delete as jest.Mock).mockRejectedValue(
      new Error('Delete error'),
    );
    await expect(service.delete(Location.HCM, 1)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});

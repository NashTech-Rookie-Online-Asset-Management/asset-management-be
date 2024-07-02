import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentState, Location } from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let mockPrisma: PrismaService;
  let mockAssetService: AssetService;

  beforeAll(async () => {
    mockPrisma = {
      account: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      asset: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      assignment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    mockAssetService = {} as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AssetService,
          useValue: mockAssetService,
        },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
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

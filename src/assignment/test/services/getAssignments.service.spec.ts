import { Test, TestingModule } from '@nestjs/testing';
import { Account, AccountType, Gender, Location } from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { AssignmentPaginationDto } from 'src/assignment/assignment.dto';
import { Messages } from 'src/common/constants';

const createdUser: Account = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  gender: Gender.MALE,
  location: Location.HCM,
  password: '123456',
  staffCode: 'ST001',
  type: AccountType.ADMIN,
  createdAt: new Date(),
  updatedAt: new Date(),
  joinedAt: new Date(),
  dob: new Date(),
  username: 'johndoe',
  status: 'ACTIVE',
};

describe('Assignment Service', () => {
  let service: AssignmentService;
  let mockPrisma: PrismaService;

  const mockAssetService = {
    updateState: jest.fn(),
  };

  beforeAll(async () => {
    mockPrisma = {
      assignment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

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

  it('Should list all assignment', async () => {
    const mockValue = [{ id: 1 }, { id: 2 }];

    (mockPrisma.assignment.findMany as jest.Mock).mockResolvedValueOnce(
      mockValue,
    );
    (mockPrisma.assignment.count as jest.Mock).mockResolvedValueOnce(2);

    const result = await service.getAll(
      createdUser,
      new AssignmentPaginationDto(),
    );
    expect(result).toEqual({
      pagination: {
        totalCount: 2,
        totalPages: 1,
      },
      data: mockValue,
    });
  });

  it('Should get one assignment', async () => {
    const mockValue = { id: 1 };

    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(
      mockValue,
    );

    const result = await service.getOne(createdUser, 1);
    expect(result).toEqual(mockValue);
  });

  it('Shoud throw error if assignment not found', async () => {
    (mockPrisma.assignment.findFirst as jest.Mock).mockResolvedValueOnce(null);

    try {
      await service.getOne(createdUser, 1);
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toEqual(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }
  });
});

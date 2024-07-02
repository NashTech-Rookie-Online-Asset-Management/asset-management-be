import { Test, TestingModule } from '@nestjs/testing';
import { Account, AccountType, Gender, Location } from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { UserPaginationDto } from 'src/assignment/assignment.dto';

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

  it('Should list all available users', async () => {
    const mockValue = [
      { id: 1, name: 'John Doe', location: Location.HCM },
      { id: 2, name: 'Jane Doe', location: Location.HCM },
    ];

    (mockPrisma.account.findMany as jest.Mock).mockResolvedValueOnce(mockValue);
    (mockPrisma.account.count as jest.Mock).mockResolvedValueOnce(2);

    const result = await service.getAvailableUser(
      createdUser,
      new UserPaginationDto(),
    );
    expect(result).toEqual({
      pagination: {
        totalCount: 2,
        totalPages: 1,
      },
      data: mockValue,
    });
  });
});

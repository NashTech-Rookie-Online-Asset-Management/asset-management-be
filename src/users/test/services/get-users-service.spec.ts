import {
  AccountType,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { adminMockup } from './config/mock-data';
import { FindAllUsersSortKey } from 'src/users/dto';
import { Order } from 'src/common/constants';

describe('UsersService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should find users by location with pagination and sorting', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        sortField: FindAllUsersSortKey.FIRST_NAME,
        sortOrder: Order.ASC,
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          assignedTos: [],
        },
        {
          id: 2,
          staffCode: 'SD0002',
          firstName: 'Jane',
          lastName: 'Smith',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(10);

      const result = await service.selectMany(username, adminMockup, dto);

      expect(result.data.length).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(10);

      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
        },
        orderBy: [
          {
            firstName: 'asc',
          },
        ],
        take: dto.take,
        skip: dto.skip,
        include: {
          assignedTos: {
            where: {
              state: {
                in: [
                  AssignmentState.WAITING_FOR_ACCEPTANCE,
                  AssignmentState.ACCEPTED,
                  AssignmentState.IS_REQUESTED,
                ],
              },
            },
            include: {
              returningRequest: {
                where: {
                  state: RequestState.WAITING_FOR_RETURNING,
                },
              },
            },
          },
        },
      });
    });

    it('should search users by name and staffCode (case-insensitive)', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        search: 'doe',
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'DOE',
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, adminMockup, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },
          OR: [
            {
              fullName: {
                contains: dto.search,
                mode: 'insensitive',
              },
            },
            {
              staffCode: {
                contains: dto.search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
        include: {
          assignedTos: {
            where: {
              state: {
                in: [
                  AssignmentState.WAITING_FOR_ACCEPTANCE,
                  AssignmentState.ACCEPTED,
                  AssignmentState.IS_REQUESTED,
                ],
              },
            },
            include: {
              returningRequest: {
                where: {
                  state: RequestState.WAITING_FOR_RETURNING,
                },
              },
            },
          },
        },
      });
    });

    it('should filter users by types', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        types: [AccountType.STAFF],
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'DOE',
          updatedAt: undefined,
          assignedTos: [],
        },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, adminMockup, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          status: {
            not: UserStatus.DISABLED,
          },

          type: {
            in: dto.types,
          },
        },
        orderBy: [],
        take: dto.take,
        skip: dto.skip,
        include: {
          assignedTos: {
            where: {
              state: {
                in: [
                  AssignmentState.WAITING_FOR_ACCEPTANCE,
                  AssignmentState.ACCEPTED,
                  AssignmentState.IS_REQUESTED,
                ],
              },
            },
            include: {
              returningRequest: {
                where: {
                  state: RequestState.WAITING_FOR_RETURNING,
                },
              },
            },
          },
        },
      });
    });
  });
});

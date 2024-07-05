import { FindAllUsersSortKey, UserPaginationDto } from 'src/users/dto';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { Order } from 'src/common/constants';
import { AccountType } from '@prisma/client';
import { adminMockup, userWithAssignedTos } from './config/mock-data';

describe('UserService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return users with pagination data when valid inputs are provided', async () => {
    // Mock input data
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(result.pagination.totalCount).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should return empty data and totalPages = 0 when no users match the search criteria', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
      search: 'nonexistent',
    };

    // Mock PrismaService methods to return no results
    jest.spyOn(mockPrismaService.account, 'findMany').mockResolvedValueOnce([]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(0);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('should handle large search string and return empty data', async () => {
    const username = 'testuser';

    const longSearchString = 'a'.repeat(265); // More than 264 characters

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
      search: longSearchString,
    };

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('should filter users by type when types array is provided in dto', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
      types: [AccountType.ADMIN, AccountType.STAFF],
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(2);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalCount).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should filter users by location when adminMockup is not ROOT', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalCount).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should handle empty search and still return results', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
      search: '',
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalCount).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should handle search by staff code when search string length is <= 6', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
      search: 'S12345',
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalCount).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should handle search by full name when search string length is > 6', async () => {
    const username = 'testuser';

    const longSearchString = 'John Doe';
    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
      search: longSearchString,
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalCount).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should handle different sort fields and orders', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.STAFF_CODE,
      sortOrder: Order.DESC,
      take: 10,
      skip: 0,
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.totalCount).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should return correct canDisable values based on assignedTos state', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.FIRST_NAME,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
    };

    // Mock PrismaService methods
    jest
      .spyOn(mockPrismaService.account, 'findMany')
      .mockResolvedValueOnce([userWithAssignedTos]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(1);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].canDisable).toBe(false);
  });

  it('should handle default case for sortField and return empty data', async () => {
    const username = 'testuser';

    const dto: UserPaginationDto = {
      sortField: FindAllUsersSortKey.STAFF_CODE,
      sortOrder: Order.ASC,
      take: 10,
      skip: 0,
    };

    jest.spyOn(mockPrismaService.account, 'findMany').mockResolvedValueOnce([]);
    jest.spyOn(mockPrismaService.account, 'count').mockResolvedValueOnce(0);

    const result = await service.selectMany(username, adminMockup, dto);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });
});

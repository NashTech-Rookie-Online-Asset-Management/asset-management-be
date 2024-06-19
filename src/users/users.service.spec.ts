import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto';
import { AccountType, Location } from '@prisma/client';
import { UsersService } from './users.service';
import { Order } from 'src/common/constants';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: PrismaService;

  beforeEach(async () => {
    mockPrismaService = {
      account: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        joinedAt: new Date('2024-06-17'),
        gender: 'MALE',
        type: 'ADMIN',
        location: Location.HCM,
      };

      const mockedCreateReturnValue = {
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockResolvedValue(
        mockedCreateReturnValue,
      );
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockedCreateReturnValue);
      expect(mockPrismaService.account.count).toHaveBeenCalled();
      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          dob: new Date('1990-01-01'),
          joinedAt: new Date('2024-06-17'),
          gender: 'MALE',
          type: 'ADMIN',
          username: 'johnd',
          password: 'hashedpassword',
          location: 'HCM',
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
    });

    it('should throw BadRequestException if create fails', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        joinedAt: new Date('2024-06-17'),
        gender: 'MALE',
        type: 'ADMIN',
        location: Location.HCM,
      };

      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUsers', () => {
    it('should find users by location with pagination and sorting', async () => {
      const username = 'test_user';
      const location = Location.HCM;
      const dto = {
        take: 10,
        skip: 0,
        staffCodeOrder: undefined,
        nameOrder: undefined,
        joinedDateOrder: undefined,
        typeOrder: Order.ASC,
      };

      (mockPrismaService.account.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 1, staffCode: 'SD0001', firstName: 'John', lastName: 'Doe' },
        { id: 2, staffCode: 'SD0002', firstName: 'Jane', lastName: 'Smith' },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(10);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.totalCount).toBe(10);

      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
        },
        orderBy: [
          {
            staffCode: dto.staffCodeOrder,
          },
          {
            firstName: dto.nameOrder,
          },
          {
            joinedAt: dto.joinedDateOrder,
          },
          {
            type: dto.typeOrder,
          },
        ],
        take: dto.take,
        skip: dto.skip,
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
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
        { id: 1, staffCode: 'SD0001', firstName: 'John', lastName: 'DOE' },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          OR: [
            { firstName: { contains: dto.search, mode: 'insensitive' } },
            { lastName: { contains: dto.search, mode: 'insensitive' } },
            { staffCode: { contains: dto.search, mode: 'insensitive' } },
          ],
        },
        orderBy: [
          {
            staffCode: undefined,
          },
          {
            firstName: undefined,
          },
          {
            joinedAt: undefined,
          },
          {
            type: undefined,
          },
        ],
        take: dto.take,
        skip: dto.skip,
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
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
        { id: 1, staffCode: 'SD0001', firstName: 'John', lastName: 'DOE' },
      ]);

      (mockPrismaService.account.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.selectMany(username, location, dto);

      expect(result.data.length).toBe(1);
      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          location,
          username: { not: username },
          type: {
            in: dto.types,
          },
        },
        orderBy: [
          {
            staffCode: undefined,
          },
          {
            firstName: undefined,
          },
          {
            joinedAt: undefined,
          },
          {
            type: undefined,
          },
        ],
        take: dto.take,
        skip: dto.skip,
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
    });
  });

  describe('getUser', () => {
    it('should get user', async () => {
      const username = 'test_user';
      const expected = {
        id: 1,
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: username,
      };

      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValueOnce(
        expected,
      );

      const result = await service.selectOne(username);

      expect(result).toEqual(expected);
      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { username },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          dob: true,
          gender: true,
          joinedAt: true,
          type: true,
          location: true,
        },
      });
    });
  });
});

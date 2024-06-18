import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto'; // Adjust the path as needed
import { Location } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: PrismaService;

  beforeEach(async () => {
    mockPrismaService = {
      account: {
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
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
});

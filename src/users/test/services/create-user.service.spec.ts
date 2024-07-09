import { BadRequestException, HttpException } from '@nestjs/common';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import {
  adminMockup,
  createUserDto,
  mockedCreateReturnValue,
} from './config/mock-data';

import * as bcrypt from 'bcryptjs';
import { AccountType, Gender, Location } from '@prisma/client';
import { Messages } from 'src/common/constants';
describe('UsersService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockResolvedValue(
        mockedCreateReturnValue,
      );
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.create(adminMockup, createUserDto);

      expect(result).toEqual(mockedCreateReturnValue);
      expect(mockPrismaService.account.count).toHaveBeenCalled();
      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          dob: new Date('1990-01-01'),
          joinedAt: new Date('2024-06-17'),
          gender: Gender.MALE,
          type: AccountType.STAFF,
          username: 'johnd',
          password: 'hashedpassword',
          location: Location.HCM,
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          username: true,
          joinedAt: true,
          location: true,
          password: true,
          type: true,
        },
      });
    });
    it('should create a user successfully with root', async () => {
      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockResolvedValue(
        mockedCreateReturnValue,
      );
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await service.create(
        { ...adminMockup, type: AccountType.ROOT },
        { ...createUserDto, location: undefined },
      );

      expect(result).toEqual(mockedCreateReturnValue);
      expect(mockPrismaService.account.count).toHaveBeenCalled();
      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          dob: new Date('1990-01-01'),
          joinedAt: new Date('2024-06-17'),
          gender: Gender.MALE,
          type: AccountType.STAFF,
          username: 'johnd',
          password: 'hashedpassword',
          location: Location.HCM,
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          username: true,
          joinedAt: true,
          location: true,
          password: true,
          type: true,
        },
      });
    });

    it('should throw BadRequestException if location is null', async () => {
      await expect(service.create(null, createUserDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.create(null, createUserDto)).rejects.toThrow(
        Messages.ASSET.FAILED.INVALID_LOCATION,
      );
    });

    // create user same type
    it('should throw BadRequestException if create same type', async () => {
      await expect(
        service.create(adminMockup, {
          ...createUserDto,
          type: AccountType.ADMIN,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(adminMockup, {
          ...createUserDto,
          type: AccountType.ADMIN,
        }),
      ).rejects.toThrow(Messages.USER.FAILED.CREATE_SAME_TYPE);
    });

    it('should handle generic errors properly', async () => {
      const mockError = new HttpException(
        {
          message: 'An error occurred',
          error: 'Internal Server Error',
          statusCode: 500,
        },
        500,
      );

      (mockPrismaService.account.create as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await expect(service.create(adminMockup, createUserDto)).rejects.toThrow(
        HttpException,
      );

      await expect(service.create(adminMockup, createUserDto)).rejects.toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            message: 'An error occurred',
            error: 'Internal Server Error',
            statusCode: 500,
          }),
          status: 500,
        }),
      );
    });

    it('should handle multiple simultaneous create requests', async () => {
      // Mocking the Prisma service methods
      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      // Simulating different return values for each create call
      const createMock1 = { ...mockedCreateReturnValue, username: 'johnd' };
      const createMock2 = { ...mockedCreateReturnValue, username: 'johnd1' };
      const createMock3 = { ...mockedCreateReturnValue, username: 'johnd2' };

      const createMocks = [createMock1, createMock2, createMock3];
      (mockPrismaService.account.create as jest.Mock).mockImplementation(() =>
        createMocks.shift(),
      );

      // Using Promise.all to handle multiple create requests
      const results = await Promise.all([
        service.create(adminMockup, createUserDto),
        service.create(adminMockup, createUserDto),
        service.create(adminMockup, createUserDto),
      ]);

      // Expecting that each user was created with a unique username
      expect(results[0].username).toBe('johnd');
      expect(results[1].username).toBe('johnd1');
      expect(results[2].username).toBe('johnd2');

      // Ensuring the Prisma service methods were called correctly
      expect(mockPrismaService.account.create).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.account.count).toHaveBeenCalledTimes(3);
    });

    it('should generate a unique username by incrementing counter', async () => {
      const similarUsernames = [
        { username: 'johnd' },
        { username: 'johnd1' },
        { username: 'johnd2' },
      ];

      jest
        .spyOn(mockPrismaService.account, 'findMany')
        .mockResolvedValue(similarUsernames as any);
      jest.spyOn(mockPrismaService.account, 'count').mockResolvedValue(0);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);
      jest
        .spyOn(mockPrismaService.account, 'create')
        .mockResolvedValue({ ...mockedCreateReturnValue } as any);

      const result = await service.create(adminMockup, createUserDto);

      expect(result.username).toBe('johnd');
    });
  });
});

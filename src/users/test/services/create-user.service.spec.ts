import { BadRequestException } from '@nestjs/common';
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

    it('should throw BadRequestException if create fails', async () => {
      (mockPrismaService.account.count as jest.Mock).mockResolvedValue(0);
      (mockPrismaService.account.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(service.create(adminMockup, createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

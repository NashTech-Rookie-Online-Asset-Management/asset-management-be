import { AccountType, Location, UserStatus } from '@prisma/client';
import { CreateAssetDto } from 'src/asset/dto';
import { UserType } from 'src/users/types';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from 'src/auth/dto';
import { CreateUserDto } from 'src/users/dto';
export const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};
export const createAssetDto: CreateAssetDto = {
  name: 'Laptop HP Probook 450 G1',
  categoryId: 1,
  specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
  installedDate: new Date(),
  state: 'AVAILABLE',
};

export const mockUser = {
  username: 'testuser',
  password: bcrypt.hash('oldpassword', 10),
  id: 1,
  staffCode: 'SD0001',
  status: 'ACTIVE',
  type: 'USER',
};

export const changePasswordDto: ChangePasswordDto = {
  oldPassword: 'oldpassword',
  newPassword: 'newpassword',
};

export const createUserDto: CreateUserDto = {
  firstName: 'John',
  lastName: 'Doe',
  dob: new Date('1990-01-01'),
  joinedAt: new Date('2024-06-17'),
  gender: 'MALE',
  type: 'ADMIN',
  location: Location.HCM,
};

export const result = {
  staffCode: 'SD0001',
  firstName: 'John',
  lastName: 'Doe',
  username: 'johnd',
  joinedAt: new Date('2024-06-17'),
  type: 'ADMIN',
};

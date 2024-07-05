import { AccountType, Gender, Location, UserStatus } from '@prisma/client';
import { CreateAssetDto } from 'src/asset/dto';
import { UserType } from 'src/users/types';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from 'src/auth/dto';
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
export const mockUserPayload = {
  username: 'testuser',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  dob: new Date(),
  gender: Gender.FEMALE,
  password: bcrypt.hash('oldpassword', 10) as unknown as string,
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  type: AccountType.STAFF,
  joinedAt: new Date(),
  location: Location.HCM,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const changePasswordDto: ChangePasswordDto = {
  oldPassword: 'oldpassword',
  newPassword: 'newpassword',
};

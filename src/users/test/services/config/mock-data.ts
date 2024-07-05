import {
  AccountType,
  AssignmentState,
  Gender,
  Location,
  UserStatus,
} from '@prisma/client';
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
export const user = {
  id: 1,
  staffCode: 'SD0001',
  username: 'nicolad',
  status: UserStatus.ACTIVE,
  type: AccountType.ADMIN,
  location: Location.HCM,
};
export const userWithAssignedTos = {
  id: 1,
  staffCode: 'S123',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  username: 'johndoe',
  password: '',
  joinedAt: new Date(),
  type: AccountType.ADMIN,
  dob: new Date(2002, 1, 29),
  gender: Gender.MALE,
  location: Location.HCM,
  status: UserStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedTos: [
    { id: 1, state: AssignmentState.ACCEPTED },
    { id: 2, state: AssignmentState.DECLINED },
  ],
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
  type: 'STAFF',
  location: Location.HCM,
};

export const mockedCreateReturnValue = {
  staffCode: 'SD0002',
  firstName: 'John',
  lastName: 'Doe',
  username: 'johnd',
  gender: 'MALE',
  dob: new Date('2024-06-17'),
  joinedAt: new Date('2024-06-17'),
  type: 'STAFF',
  location: Location.HCM,
};

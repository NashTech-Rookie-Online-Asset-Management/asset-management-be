import {
  Account,
  AccountType,
  Gender,
  Location,
  UserStatus,
} from '@prisma/client';
import { AssignmentDto } from 'src/assignment/assignment.dto';
import { UserType } from 'src/users/types';

export const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
};

export const mockCreateAssignmentResult = {
  id: 1,
  userId: 1,
  assetId: 1,
  assignedAt: new Date(),
};

export const createdUser: Account = {
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

export const createAssignmentDto: AssignmentDto = {
  assetCode: 'AS001',
  staffCode: 'ST001',
  assignedDate: new Date().toLocaleString(),
  note: 'Note',
};

export const mockAssetResult = [
  { id: 1, name: 'Asset 1', location: 'Jakarta' },
  { id: 2, name: 'Asset 2', location: 'Jakarta' },
];

export const mockUserResult = [
  { id: 1, name: 'John Doe', location: 'Jakarta' },
  { id: 2, name: 'Jane Doe', location: 'Jakarta' },
];

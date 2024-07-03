import {
  Account,
  AccountType,
  AssetState,
  AssignmentState,
  Gender,
  Location,
  UserStatus,
} from '@prisma/client';
import { UserType } from 'src/users/types';

export const adminMockup: UserType = {
  id: 1,
  staffCode: 'SD0001',
  status: UserStatus.ACTIVE,
  location: Location.HCM,
  type: AccountType.ADMIN,
  username: 'admin',
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

export const assignmentDto = {
  assetCode: 'AS001',
  staffCode: 'ST001',
  assignedDate: new Date().toLocaleString(),
  note: null,
};

export const assignedUser: Account = {
  id: 2,
  firstName: 'Jane',
  lastName: 'Doe',
  fullName: 'Jane Doe',
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

export const assignedAsset = {
  id: 1,
  name: 'Laptop',
  state: AssetState.AVAILABLE,
  location: Location.HCM,
};

export const assignment = {
  id: 1,
  assetId: 1,
  assignedById: 1,
  assignedToId: 2,
  note: null,
  state: AssignmentState.WAITING_FOR_ACCEPTANCE,
  assignedDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),

  asset: {
    assetCode: 'AS001',
  },
  assignedTo: {
    location: Location.DN,
  },
};

export const updatedAssignedAsset = {
  id: 2,
  name: 'Laptop 2',
  state: AssetState.AVAILABLE,
  location: Location.HCM,
};

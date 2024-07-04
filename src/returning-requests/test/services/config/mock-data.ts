import {
  AccountType,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import { CreateAssetDto } from 'src/asset/dto';
import { UserType } from 'src/users/types';

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

export const returnRequestMock = {
  id: 1,
  state: RequestState.WAITING_FOR_RETURNING,
  assignmentId: 1,
  requestedById: 1,
  acceptedById: 1,
  assignment: {
    id: 1,
    state: AssignmentState.ACCEPTED,
    asset: {
      id: 1,
      location: Location.HCM,
    },
  },
};

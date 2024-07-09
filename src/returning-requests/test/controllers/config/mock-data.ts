import { AccountType, AssetState, Location, UserStatus } from '@prisma/client';
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

export const location: Location = Location.HCM;
export const createAssetDto: CreateAssetDto = {
  name: 'Laptop HP Probook 450 G1',
  categoryId: 1,
  specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
  installedDate: new Date(),
  state: AssetState.AVAILABLE,
};
export const result = {
  id: 1,
  name: 'Laptop HP Probook 450 G1',
  assetCode: 'L00001',
  specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
  state: AssetState.AVAILABLE,
  category: {
    name: 'Laptop',
    prefix: 'L',
  },
  assignments: [],
};

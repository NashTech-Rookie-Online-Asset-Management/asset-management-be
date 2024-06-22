import { AccountType, Location, UserStatus } from '@prisma/client';

export interface UserType {
  id: number;
  staffCode: string;
  username: string;
  status: UserStatus;
  type: AccountType;
  location: Location;
}

import { Location } from '@prisma/client';

export interface PayloadType {
  username: string;
  sub: number;
  staffCode: string;
  status: string;
  type: string;
  location: Location;
  iat?: number;
  exp?: number;
}

import { PayloadType } from '../types';

export class LoginResponseDto {
  accessToken: string;

  refreshToken: string;

  payload: PayloadType;
}

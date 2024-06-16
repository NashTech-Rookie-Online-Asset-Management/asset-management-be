import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh is required' })
  @IsString()
  refreshToken: string;
}

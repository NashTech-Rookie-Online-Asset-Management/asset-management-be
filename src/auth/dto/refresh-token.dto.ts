import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Refresh is required' })
  @IsString()
  refreshToken: string;
}

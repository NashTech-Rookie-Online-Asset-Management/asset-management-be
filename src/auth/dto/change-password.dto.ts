import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @ApiProperty()
  @MinLength(8)
  @IsStrongPassword()
  newPassword: string;
}

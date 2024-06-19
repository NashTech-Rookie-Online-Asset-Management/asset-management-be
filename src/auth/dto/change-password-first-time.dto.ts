import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordFirstTimeDto {
  @ApiProperty()
  @MinLength(8)
  @IsStrongPassword()
  newPassword: string;
}

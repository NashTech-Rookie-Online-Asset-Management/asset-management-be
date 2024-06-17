import { IsString, IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @MinLength(8)
  @IsStrongPassword()
  newPassword: string;
}

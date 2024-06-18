import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  password: string;
}

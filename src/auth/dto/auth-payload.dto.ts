import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Messages } from 'src/common/constants';

export class AuthPayloadDto {
  @ApiProperty()
  @IsNotEmpty({ message: Messages.AUTH.VALIDATE.USER_NAME })
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.AUTH.VALIDATE.PASSWORD })
  @IsString()
  password: string;
}

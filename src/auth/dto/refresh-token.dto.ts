import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Messages } from 'src/common/constants';

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty({ message: Messages.AUTH.VALIDATE.REFRESH })
  @IsString()
  refreshToken: string;
}

import { AccountType, Gender } from '@prisma/client';
import { IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { IsOlderThan18 } from '../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Messages } from 'src/common/constants';

export class UpdateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: Messages.USER.VALIDATE.DOB })
  @IsDateString()
  @IsOlderThan18()
  @IsOptional()
  dob: Date;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.USER.VALIDATE.JOINED_DATE })
  @IsDateString()
  @IsOptional()
  joinedAt: Date;

  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender, { message: Messages.USER.VALIDATE.GENDER_INVALID })
  @IsOptional()
  gender: Gender;

  @ApiProperty({ enum: AccountType })
  @IsNotEmpty()
  @IsEnum(AccountType, { message: Messages.USER.VALIDATE.LOCATION_INVALID })
  @IsOptional()
  type: AccountType;
}

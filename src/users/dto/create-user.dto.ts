import { AccountType, Gender, Location } from '@prisma/client';
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import {
  IsOlderThan18,
  IsValidJoinedDate,
  IsValidName,
} from '../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Messages } from 'src/common/constants';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsValidName()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsValidName()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.USER.VALIDATE.DOB })
  @IsDateString()
  @IsOlderThan18()
  dob: Date;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.USER.VALIDATE.JOINED_DATE })
  @IsDateString()
  @IsValidJoinedDate()
  joinedAt: Date;

  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender, { message: Messages.USER.VALIDATE.GENDER_INVALID })
  gender: Gender;

  @ApiProperty({ enum: AccountType })
  @IsNotEmpty()
  @IsEnum(AccountType, { message: Messages.USER.VALIDATE.ACCOUNT_TYPE_INVALID })
  type: AccountType;

  @ApiProperty({ enum: Location })
  @IsNotEmpty()
  @IsOptional()
  @IsEnum(Location, { message: Messages.USER.VALIDATE.LOCATION_INVALID })
  location?: Location;
}

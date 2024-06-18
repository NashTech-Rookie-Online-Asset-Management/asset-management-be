import { AccountType, Gender, Location } from '@prisma/client';
import { IsNotEmpty, IsDateString, IsEnum, IsString } from 'class-validator';
import {
  IsOlderThan18,
  IsValidJoinedDate,
  IsValidName,
} from '../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsNotEmpty({ message: 'Date of Birth is required' })
  @IsDateString()
  @IsOlderThan18()
  dob: Date;

  @ApiProperty()
  @IsNotEmpty({ message: 'Joined Date is required' })
  @IsDateString()
  @IsValidJoinedDate()
  joinedAt: Date;

  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender, { message: 'Invalid gender' })
  gender: Gender;

  @ApiProperty({ enum: AccountType })
  @IsNotEmpty()
  @IsEnum(AccountType, { message: 'Invalid account type' })
  type: AccountType;

  @ApiProperty({ enum: Location })
  @IsNotEmpty()
  @IsEnum(Location, { message: 'Invalid location' })
  location: Location;
}

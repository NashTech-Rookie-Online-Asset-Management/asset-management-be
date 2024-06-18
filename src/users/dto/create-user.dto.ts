import { AccountType, Gender, Location } from '@prisma/client';
import { IsNotEmpty, IsDateString, IsEnum, IsString } from 'class-validator';
import {
  IsOlderThan18,
  IsValidJoinedDate,
  IsValidName,
} from '../../common/decorators';

export class CreateUserDto {
  @IsString()
  @IsValidName()
  firstName: string;

  @IsString()
  @IsValidName()
  lastName: string;

  @IsNotEmpty({ message: 'Date of Birth is required' })
  @IsDateString()
  @IsOlderThan18()
  dob: Date;

  @IsNotEmpty({ message: 'Joined Date is required' })
  @IsDateString()
  @IsValidJoinedDate()
  joinedAt: Date;

  @IsNotEmpty()
  @IsEnum(Gender, { message: 'Invalid gender' })
  gender: Gender;

  @IsNotEmpty()
  @IsEnum(AccountType, { message: 'Invalid account type' })
  type: AccountType;

  @IsNotEmpty()
  @IsEnum(Location, { message: 'Invalid location' })
  location: Location;
}

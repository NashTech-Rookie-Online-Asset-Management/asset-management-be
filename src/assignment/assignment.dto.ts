import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class AssignmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  staffCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  assetCode: string;

  @IsDateString()
  @ApiProperty()
  assignedDate: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(0, 255)
  note: string;
}

export enum UserSortKey {
  STAFF_CODE = 'staffCode',
  FULL_NAME = 'fullName',
  TYPE = 'type',
}

export enum AssetSortKey {
  ASSET_CODE = 'assetCode',
  ASSET_NAME = 'name',
  ASSET_CATEGORY = 'category',
}

export class UserPaginationDto extends PaginationDto {
  @IsEnum(UserSortKey)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserSortKey,
  })
  readonly sortField: UserSortKey = UserSortKey.STAFF_CODE;

  // To exclude it's user to available user list
  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  assignmentId?: string;
}

export class AssetPaginationDto extends PaginationDto {
  @IsEnum(AssetSortKey)
  @IsOptional()
  @ApiPropertyOptional({
    enum: AssetSortKey,
  })
  readonly sortField: AssetSortKey = AssetSortKey.ASSET_CODE;
}

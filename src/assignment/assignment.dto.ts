import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentState } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
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
  @Length(0, 256)
  note: string;

  @IsDateString()
  @ApiProperty()
  @IsOptional()
  updatedAt?: Date | string;
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

export enum AssignmentSortKey {
  ID = 'id',
  ASSET_CODE = 'assetCode',
  ASSET_NAME = 'assetName',
  ASSIGNED_TO = 'assignedTo',
  ASSIGNED_BY = 'assignedBy',
  ASSIGNED_DATE = 'assignedDate',
  STATE = 'state',
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

export class AssignmentPaginationDto extends PaginationDto {
  @IsEnum(AssignmentSortKey)
  @IsOptional()
  @ApiPropertyOptional({
    enum: AssignmentSortKey,
  })
  readonly sortField: AssignmentSortKey = AssignmentSortKey.ID;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsEnum(AssignmentState, { each: true })
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  readonly states?: AssignmentState[] = [
    AssignmentState.ACCEPTED,
    AssignmentState.DECLINED,
    AssignmentState.WAITING_FOR_ACCEPTANCE,
  ];
}

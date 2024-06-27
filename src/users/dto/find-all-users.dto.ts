import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum FindAllUsersSortKey {
  STAFF_CODE = 'staffCode',
  FIRST_NAME = 'name',
  JOINDED_AT = 'joinedAt',
  TYPE = 'type',
}

export class UserPaginationDto extends PaginationDto {
  @IsEnum(FindAllUsersSortKey)
  @IsOptional()
  @ApiPropertyOptional({
    enum: FindAllUsersSortKey,
  })
  readonly sortField?: FindAllUsersSortKey = FindAllUsersSortKey.FIRST_NAME;

  // Filter
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccountType, { each: true })
  @Transform(({ value }) => value.trim().split(','))
  readonly types?: AccountType[] = [AccountType.ADMIN, AccountType.STAFF];
}

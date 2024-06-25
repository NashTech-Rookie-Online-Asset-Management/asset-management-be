import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MAX_PAGE_SIZE, Order } from 'src/common/constants';

export class UserPageOptions {
  // Pagination
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @IsOptional()
  readonly take?: number = MAX_PAGE_SIZE;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  // Search
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  readonly search?: string;

  // Sort
  @ApiPropertyOptional({
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly staffCodeOrder?: Order | undefined;

  @ApiPropertyOptional({
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly nameOrder?: Order | undefined;

  @ApiPropertyOptional({
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly joinedDateOrder?: Order | undefined;

  @ApiPropertyOptional({
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly typeOrder?: Order | undefined;

  @ApiPropertyOptional({
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly updatedAtOrder?: Order | undefined;

  // Filter
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(AccountType, { each: true })
  @Transform(({ value }) => value.trim().split(','))
  readonly types?: AccountType[] = [AccountType.ADMIN, AccountType.STAFF];
}

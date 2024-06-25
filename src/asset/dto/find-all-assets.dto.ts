import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetState } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MAX_PAGE_SIZE, Order } from 'src/common/constants';

export class AssetPageOptions {
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
    enum: ['assetCode', 'name', 'category', 'state'],
  })
  @IsEnum(['assetCode', 'name', 'category', 'state'])
  @IsOptional()
  readonly sortField?: 'assetCode' | 'name' | 'category' | 'state' =
    'assetCode';

  @ApiPropertyOptional({
    enum: Order,
    default: Order.ASC,
  })
  @IsEnum(Order)
  @IsOptional()
  readonly sortOrder?: Order = Order.ASC;

  // Filter
  @ApiPropertyOptional()
  @IsArray()
  @IsEnum(AssetState, { each: true })
  @IsOptional()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.trim().split(','))
  readonly states?: AssetState[] = [
    AssetState.AVAILABLE,
    AssetState.UNAVAILABLE,
    AssetState.ASSIGNED,
  ];

  @ApiPropertyOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  @ArrayNotEmpty()
  @Transform(({ value }) =>
    value
      .trim()
      .split(',')
      .map((id) => Number(id)),
  )
  readonly categoryIds?: number[];
}

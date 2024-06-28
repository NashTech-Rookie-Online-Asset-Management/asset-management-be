import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetState } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class AssetPageOptions extends PaginationDto {
  // Sort
  @ApiPropertyOptional({
    enum: ['assetCode', 'name', 'category', 'state', 'updatedAt'],
  })
  @IsEnum(['assetCode', 'name', 'category', 'state', 'updatedAt'])
  @IsOptional()
  readonly sortField?:
    | 'assetCode'
    | 'name'
    | 'category'
    | 'state'
    | 'updatedAt' = 'assetCode';

  // Filter
  @ApiPropertyOptional()
  @IsArray()
  @IsEnum(AssetState, { each: true })
  @IsOptional()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.trim().split(','))
  readonly states?: AssetState[] = [
    AssetState.AVAILABLE,
    AssetState.NOT_AVAILABLE,
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

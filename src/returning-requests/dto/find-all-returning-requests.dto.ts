import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestState } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum FindAllReturningRequestsSortKey {
  ID = 'id',
  ASSET_CODE = 'assetCode',
  ASSET_NAME = 'assetName',
  REQUESTED_BY = 'requestedBy',
  ASSIGNED_DATE = 'assignedDate',
  ACCEPTED_BY = 'acceptedBy',
  RETURNED_DATE = 'returnedDate',
  STATE = 'state',
}

export class ReturningRequestPageOptions extends PaginationDto {
  // Sort
  @ApiPropertyOptional({
    enum: FindAllReturningRequestsSortKey,
  })
  @IsEnum(FindAllReturningRequestsSortKey)
  @IsOptional()
  readonly sortField?: FindAllReturningRequestsSortKey =
    FindAllReturningRequestsSortKey.ID;

  // Filter
  @ApiPropertyOptional()
  @IsArray()
  @IsEnum(RequestState, { each: true })
  @IsOptional()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.trim().split(','))
  readonly states?: RequestState[] = [
    RequestState.COMPLETED,
    RequestState.WAITING_FOR_RETURNING,
  ];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  readonly returnedDate?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum AssignmentSortKey {
  ASSET_CODE = 'assetCode',
  ASSET_NAME = 'name',
  CATEGORY = 'category',
  ASSIGNED_DATE = 'assignedDate',
  STATE = 'state',
}

export class AssignmentPaginationDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: AssignmentSortKey,
  })
  @IsEnum(AssignmentSortKey)
  @IsOptional()
  readonly sortField?: AssignmentSortKey;
}

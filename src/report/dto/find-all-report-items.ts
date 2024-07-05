import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_PAGE_SIZE } from 'src/common/constants';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum FindAllReportItemsSortKey {
  CATEGORY = 'categoryName',
  TOTAL = 'total',
  ASSIGNED = 'assigned',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'notAvailable',
  WAITING_FOR_RECYCLING = 'waitingForRecycling',
  RECYCLED = 'recycled',
}

export class ReportPaginationDto extends PaginationDto {
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly take?: number;

  @IsOptional()
  @IsEnum(FindAllReportItemsSortKey)
  @ApiPropertyOptional({
    enum: FindAllReportItemsSortKey,
    default: FindAllReportItemsSortKey.CATEGORY,
  })
  readonly sortField?: FindAllReportItemsSortKey =
    FindAllReportItemsSortKey.CATEGORY;
}

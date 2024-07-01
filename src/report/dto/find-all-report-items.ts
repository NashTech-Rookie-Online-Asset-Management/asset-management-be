import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
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
  @IsEnum(FindAllReportItemsSortKey)
  @ApiPropertyOptional({
    enum: FindAllReportItemsSortKey,
    default: FindAllReportItemsSortKey.CATEGORY,
  })
  readonly sortField?: FindAllReportItemsSortKey =
    FindAllReportItemsSortKey.CATEGORY;
}

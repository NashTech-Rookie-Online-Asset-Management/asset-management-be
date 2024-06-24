import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssignmentDto {
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
  note: string;
}

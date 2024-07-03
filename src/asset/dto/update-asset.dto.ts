import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetState } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Messages } from 'src/common/constants';

export class UpdateAssetDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Length(2, 64)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(5, 256)
  @IsOptional()
  specification?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  installedDate?: Date;

  @ApiPropertyOptional({
    enum: AssetState,
    default: AssetState.AVAILABLE,
  })
  @IsEnum(AssetState, { message: Messages.ASSET.VALIDATE.ASSET_STATE_INVALID })
  @IsOptional()
  state?: AssetState;

  @ApiPropertyOptional()
  @IsOptional()
  updatedAt?: Date | string;
}

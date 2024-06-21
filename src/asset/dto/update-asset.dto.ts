import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetState } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Messages } from 'src/common/constants';

export class UpdateAssetDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
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
}

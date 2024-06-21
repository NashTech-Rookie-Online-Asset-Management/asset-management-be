import { ApiProperty } from '@nestjs/swagger';
import { AssetState } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Messages } from 'src/common/constants';

export class CreateAssetDto {
  @ApiProperty()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.NAME })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.CATEGORY })
  categoryId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  specification?: string;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.INSTALLED_DATE })
  @IsDateString()
  installedDate: Date;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.STATE })
  @IsEnum(AssetState, { message: Messages.ASSET.VALIDATE.STATE_INVALID })
  state: AssetState;
}

import { ApiProperty } from '@nestjs/swagger';
import { AssetState } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Messages } from 'src/common/constants';

export class CreateAssetDto {
  @ApiProperty()
  @Length(2, 64)
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.NAME })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.CATEGORY })
  categoryId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.SPECIFICATION })
  @Length(5, 256)
  specification: string;

  @ApiProperty()
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.INSTALLED_DATE })
  @IsDateString()
  installedDate: Date;

  @ApiProperty({
    enum: AssetState,
    default: AssetState.AVAILABLE,
  })
  @IsNotEmpty({ message: Messages.ASSET.VALIDATE.STATE })
  @IsEnum(AssetState, { message: Messages.ASSET.VALIDATE.STATE_INVALID })
  state: AssetState;
}

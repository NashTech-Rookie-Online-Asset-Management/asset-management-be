import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsUppercase, Length } from 'class-validator';
import { Messages } from 'src/common/constants';
import { Transform, TransformFnParams } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsUppercase({ message: Messages.CATEGORY.VALIDATE.PREFIX_UPPER_CASE })
  @Length(2, 2, { message: Messages.CATEGORY.VALIDATE.PREFIX_LENGTH })
  prefix?: string;
}

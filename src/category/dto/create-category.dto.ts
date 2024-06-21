import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, IsUppercase, Length } from 'class-validator';
import { Messages } from 'src/common/constants';

export class CreateCategoryDto {
  @IsNotEmpty({ message: Messages.CATEGORY.VALIDATE.NAME })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: Messages.CATEGORY.VALIDATE.PREFIX })
  @IsString()
  @IsUppercase({ message: Messages.CATEGORY.VALIDATE.PREFIX_UPPER_CASE })
  @Length(2, 2, { message: Messages.CATEGORY.VALIDATE.PREFIX_LENGTH })
  prefix: string;
}

import { Messages } from 'src/common/constants';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleReturnRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: Messages.RETURNING_REQUEST.VALIDATE.STATE,
  })
  @IsBoolean({
    message: Messages.RETURNING_REQUEST.VALIDATE.STATE_INVALID,
  })
  state: boolean;
}

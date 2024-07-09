import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Messages } from 'src/common/constants';

export class ResponseAssignmentDto {
  @ApiProperty()
  @IsNotEmpty({
    message: Messages.ASSIGNMENT.VALIDATE.STATE,
  })
  @IsBoolean({
    message: Messages.RETURNING_REQUEST.VALIDATE.STATE_INVALID,
  })
  state: boolean;
}

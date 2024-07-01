import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ReturningRequestsService } from './returning-requests.service';
import { User } from 'src/common/decorators/user.decorator';
import { ToggleReturnRequestDto } from './dto';
import { UserType } from 'src/users/types';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators';
import { AccountType } from '@prisma/client';

@Controller('returning-requests')
@ApiTags('RETURNING-REQUESTS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountType.ADMIN)
export class ReturningRequestsController {
  constructor(
    private readonly returningRequestsService: ReturningRequestsService,
  ) {}

  @Patch(':id')
  toggleReturningRequest(
    @User() admin: UserType,
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: ToggleReturnRequestDto,
  ) {
    return this.returningRequestsService.toggleReturningRequest(
      admin,
      requestId,
      dto,
    );
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountType, Location } from '@prisma/client';
import { GetUser, Roles } from 'src/common/decorators';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserType } from 'src/users/types';
import { ReturningRequestPageOptions, ToggleReturnRequestDto } from './dto';
import { ReturningRequestsService } from './returning-requests.service';

@Controller('returning-requests')
@ApiTags('RETURNING-REQUESTS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountType.ADMIN)
export class ReturningRequestsController {
  constructor(
    private readonly returningRequestsService: ReturningRequestsService,
  ) {}

  @Get()
  getAll(
    @GetUser('location') location: Location,
    @Query() dto: ReturningRequestPageOptions,
  ) {
    return this.returningRequestsService.getAll(location, dto);
  }

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

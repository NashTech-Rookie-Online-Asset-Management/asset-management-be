import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser, Roles } from 'src/common/decorators';
import { Account, AccountType } from '@prisma/client';
import {
  AssetPaginationDto,
  AssignmentDto,
  UserPaginationDto,
} from './assignment.dto';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('assignment')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('ASSIGNMENTS')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get()
  @Roles(AccountType.ADMIN)
  getAll(@GetUser() user: Account) {
    return this.assignmentService.getAll(user);
  }

  @Get(':id')
  @Roles(AccountType.ADMIN)
  getOne(@GetUser() user: Account, @Param('id', ParseIntPipe) id: number) {
    return this.assignmentService.getOne(user, id);
  }

  @Get('user/available')
  @Roles(AccountType.ADMIN)
  getAvailableUser(@GetUser() user: Account, @Query() dto: UserPaginationDto) {
    return this.assignmentService.getAvailableUser(user, dto);
  }

  @Get('asset/available')
  @Roles(AccountType.ADMIN)
  getAvailableAsset(
    @GetUser() user: Account,
    @Query() dto: AssetPaginationDto,
  ) {
    return this.assignmentService.getAvailableAsset(user, dto);
  }

  @Post()
  @Roles(AccountType.ADMIN)
  create(@GetUser() user: Account, @Body() dto: AssignmentDto) {
    return this.assignmentService.create(user, dto);
  }

  @Put(':id')
  @Roles(AccountType.ADMIN)
  update(
    @GetUser() user: Account,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignmentDto,
  ) {
    return this.assignmentService.update(user, id, dto);
  }
}

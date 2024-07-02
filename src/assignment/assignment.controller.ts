import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Account, AccountType, Location } from '@prisma/client';
import { BaseController } from 'src/common/base/base.controller';
import { Order } from 'src/common/constants';
import { GetUser, Roles } from 'src/common/decorators';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserType } from 'src/users/types';
import {
  AssetPaginationDto,
  AssignmentDto,
  UserPaginationDto,
} from './assignment.dto';
import { AssignmentService } from './assignment.service';
import {
  AssignmentPaginationDto,
  AssignmentSortKey,
  ResponseAssignmentDto,
} from './dto';

@Controller('assignment')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('ASSIGNMENTS')
export class AssignmentController extends BaseController {
  constructor(private readonly assignmentService: AssignmentService) {
    super();
  }

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
    const event = this.actionQueue.createEvent(() =>
      this.assignmentService.create(user, dto),
    );
    this.actionQueue.push(event);
    return this.actionQueue.wait(event.rqid);
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

  @Put('return/:id')
  @Roles(AccountType.ADMIN, AccountType.STAFF)
  requestReturn(
    @User() user: UserType,
    @Param('id', ParseIntPipe) assignmentId: number,
  ) {
    return this.assignmentService.requestReturn(user, assignmentId);
  }

  @Put('respond/:id')
  @Roles(AccountType.ADMIN, AccountType.STAFF)
  responseAssignment(
    @User() user: UserType,
    @Param('id', ParseIntPipe) assignmentId: number,
    @Body() dto: ResponseAssignmentDto,
  ) {
    return this.assignmentService.responseAssignedAssignment(
      user,
      assignmentId,
      dto,
    );
  }

  @Get('user/assignments')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'sortField', enum: AssignmentSortKey, required: false })
  @ApiQuery({ name: 'sortOrder', enum: Order, required: false })
  @Roles(AccountType.ROOT, AccountType.ADMIN, AccountType.STAFF)
  async getUserAssignments(
    @User() user: UserType,
    @Query() pagination: AssignmentPaginationDto,
  ) {
    return this.assignmentService.getUserAssignments(user, pagination);
  }

  @Delete(':id')
  @Roles(AccountType.ADMIN)
  delete(
    @GetUser('location') location: Location,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.assignmentService.delete(location, id);
  }
}

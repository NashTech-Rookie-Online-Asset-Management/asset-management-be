import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser, Roles } from 'src/common/decorators';
import { Account, AccountType } from '@prisma/client';
import { CreateAssignmentDto } from './assignment.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('assignment')
@UseGuards(JwtAuthGuard)
@Roles(AccountType.ADMIN)
@Roles(AccountType.ROOT)
@ApiTags('ASSIGNMENTS')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('user/available')
  getAvailableUser(@GetUser() user: Account) {
    return this.assignmentService.getAvailableUser(user);
  }

  @Get('asset/available')
  getAvailableAsset(@GetUser() user: Account) {
    return this.assignmentService.getAvailableAsset(user);
  }

  @Post()
  create(@GetUser() user: Account, @Body() dto: CreateAssignmentDto) {
    return this.assignmentService.create(user, dto);
  }
}

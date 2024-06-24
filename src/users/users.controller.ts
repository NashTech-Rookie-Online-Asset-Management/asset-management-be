import { JwtAuthGuard } from './../common/guards/jwt-auth.guard';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../common/guards/role.guard';
import { GetUser, Roles } from '../common/decorators';
import { AccountType } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto, UserPageOptions } from './dto';
import { Location } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { UserType } from './types';
@Controller('users')
@ApiTags('USERS')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountType.ADMIN)
  @Post()
  create(@User() admin: UserType, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(admin, createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountType.ADMIN)
  @Patch(':staffCode')
  update(
    @User() admin: UserType,
    @Param('staffCode') userStaffCode: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(admin, userStaffCode, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Get()
  async getUsers(
    @GetUser('username') username: string,
    @GetUser('location') location: Location,
    @Query() dto: UserPageOptions,
  ) {
    return this.usersService.selectMany(username, location, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Get(':username')
  async getUser(@Param('username') username: string) {
    return this.usersService.selectOne(username);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Delete(':staffCode')
  async disabledUser(@Param('staffCode') userStaffCode: string) {
    return this.usersService.disable(userStaffCode);
  }
}

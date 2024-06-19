import { JwtAuthGuard } from './../common/guards/jwt-auth.guard';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../common/guards/role.guard';
import { GetUser, Roles } from '../common/decorators';
import { AccountType } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UserPageOptions } from './dto';
import { Location } from '@prisma/client';
@Controller('users')
@ApiTags('USERS')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountType.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
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
}

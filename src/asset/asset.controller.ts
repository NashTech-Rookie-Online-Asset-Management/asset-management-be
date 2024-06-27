import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountType, Location } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UserType } from 'src/users/types';
import { AssetService } from './asset.service';
import { AssetPageOptions, CreateAssetDto, UpdateAssetDto } from './dto';

@Controller('assets')
@ApiTags('ASSETS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountType.ADMIN, AccountType.ROOT)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  getAssets(
    @GetUser('location') location: Location,
    @Query() dto: AssetPageOptions,
  ) {
    return this.assetService.getAssets(location, dto);
  }

  @Get(':id')
  getAsset(
    @GetUser('location') location: Location,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.assetService.getAsset(location, id);
  }

  @Post()
  createAsset(
    @GetUser('location') location: Location,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    return this.assetService.create(location, createAssetDto);
  }

  @Patch(':id')
  updateAsset(
    @User() admin: UserType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetService.update(admin, id, dto);
  }

  @Delete(':id')
  deleteAsset(
    @GetUser('location') location: Location,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.assetService.delete(location, id);
  }
}

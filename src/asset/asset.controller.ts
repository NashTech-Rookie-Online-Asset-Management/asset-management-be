import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountType, Location } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AssetService } from './asset.service';
import { AssetPageOptions, CreateAssetDto, UpdateAssetDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('assets')
@ApiTags('ASSETS')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Get()
  getAssets(
    @GetUser('location') location: Location,
    @Query() dto: AssetPageOptions,
  ) {
    return this.assetService.getAssets(location, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Get(':id')
  getAsset(
    @GetUser('location') location: Location,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.assetService.getAsset(location, id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Post()
  createAsset(
    @GetUser('location') location: Location,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    return this.assetService.create(location, createAssetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Patch(':id')
  updateAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetService.update(id, dto);
  }
}

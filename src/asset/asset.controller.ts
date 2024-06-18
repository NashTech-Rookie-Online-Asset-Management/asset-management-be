import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccountType, Location } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AssetService } from './asset.service';
import { AssetPageOptions } from './dto';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(AccountType.ADMIN)
  @Get()
  async getAssets(
    @GetUser('location') location: Location,
    @Query() dto: AssetPageOptions,
  ) {
    return this.assetService.getAssets(location, dto);
  }
}

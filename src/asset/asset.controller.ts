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
  Res,
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
import { BaseController } from 'src/common/base/base.controller';
import { ReportPaginationDto } from 'src/report/dto';
import { ReportService } from 'src/report/report.service';
import { FileFormat } from 'src/common/constants/file-format';
import { Response } from 'express';
import { formatDate } from 'src/common/utils';

@Controller('assets')
@ApiTags('ASSETS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountType.ADMIN, AccountType.ROOT)
export class AssetController extends BaseController {
  constructor(
    private readonly assetService: AssetService,
    private readonly reportService: ReportService,
  ) {
    super();
  }

  @Get()
  getAssets(
    @GetUser('location') location: Location,
    @Query() dto: AssetPageOptions,
  ) {
    return this.assetService.getAssets(location, dto);
  }

  @Get('/report')
  getReport(@Query() dto: ReportPaginationDto) {
    return this.reportService.selectMany(dto);
  }

  @Get('/report/export')
  async getReportFile(
    @Query('format') format: FileFormat,
    @Res() res: Response,
  ) {
    const buffer = (await this.reportService.export(format)) as Buffer;

    return res
      .set(
        'Content-Disposition',
        `attachment; filename=OAM Report ${formatDate(new Date())}.${format}`,
      )
      .send(buffer);
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
    const event = this.actionQueue.createEvent(() =>
      this.assetService.create(location, createAssetDto),
    );
    this.actionQueue.push(event);
    return this.actionQueue.wait(event.rqid);
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

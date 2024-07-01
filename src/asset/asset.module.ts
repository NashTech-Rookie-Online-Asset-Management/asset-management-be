import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { ReportService } from 'src/report/report.service';

@Module({
  controllers: [AssetController],
  providers: [AssetService, ReportService],
})
export class AssetModule {}

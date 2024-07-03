import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { ReportService } from 'src/report/report.service';
import { FileService } from 'src/file/file.service';

@Module({
  controllers: [AssetController],
  providers: [AssetService, ReportService, FileService],
})
export class AssetModule {}

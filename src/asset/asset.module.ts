import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { ReportService } from 'src/report/report.service';
import { FileService } from 'src/file/file.service';
import { LockModule } from 'src/lock/lock.module';

@Module({
  imports: [LockModule],
  controllers: [AssetController],
  providers: [AssetService, ReportService, FileService],
})
export class AssetModule {}

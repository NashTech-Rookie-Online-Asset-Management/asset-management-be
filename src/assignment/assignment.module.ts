import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { AssetService } from 'src/asset/asset.service';
import { LockModule } from 'src/lock/lock.module';

@Module({
  imports: [LockModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, AssetService],
})
export class AssignmentModule {}

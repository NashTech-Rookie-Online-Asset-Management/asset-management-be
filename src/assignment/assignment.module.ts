import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { AssetService } from 'src/asset/asset.service';

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService, AssetService],
})
export class AssignmentModule {}

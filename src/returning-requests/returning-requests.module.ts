import { Module } from '@nestjs/common';
import { ReturningRequestsService } from './returning-requests.service';
import { ReturningRequestsController } from './returning-requests.controller';

@Module({
  controllers: [ReturningRequestsController],
  providers: [ReturningRequestsService],
})
export class ReturningRequestsModule {}

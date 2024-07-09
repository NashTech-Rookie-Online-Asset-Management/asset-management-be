import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LockModule } from 'src/lock/lock.module';

@Module({
  imports: [LockModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

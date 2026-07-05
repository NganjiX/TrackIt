import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [UsersModule, CommonModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

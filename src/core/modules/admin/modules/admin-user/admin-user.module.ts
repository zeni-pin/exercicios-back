import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { DocumentModule } from './document/document.module';

@Module({
  controllers: [AdminUserController],
  providers: [AdminUserService],
  imports: [DocumentModule],
})
export class AdminUserModule {}

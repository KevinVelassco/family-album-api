import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupRequest } from './group-request.entity';
import { GroupRequestService } from './group-request.service';
import { GroupRequestController } from './group-request.controller';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [TypeOrmModule.forFeature([GroupRequest]), UserModule, GroupModule],
  controllers: [GroupRequestController],
  providers: [GroupRequestService],
})
export class GroupRequestModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupLabelService } from './group-label.service';
import { GroupLabelController } from './group-label.controller';
import { GroupLabel } from './group-label.entity';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [TypeOrmModule.forFeature([GroupLabel]), GroupModule],
  controllers: [GroupLabelController],
  providers: [GroupLabelService],
})
export class GroupLabelModule {}

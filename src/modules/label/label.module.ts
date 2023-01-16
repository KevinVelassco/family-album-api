import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { Label } from './label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  controllers: [LabelController],
  providers: [LabelService],
})
export class LabelModule {}

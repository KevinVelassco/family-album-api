import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { CustomExceptionFilter } from './filters';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class CommonModule {}

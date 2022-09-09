import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enabling for cors policy
  app.enableCors();

  // getting the config service
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('config.app.port');

  const ENV = configService.get<string>('config.environment');

  await app.listen(PORT, () => {
    Logger.log(`app listening at ${PORT} in ${ENV}`, 'main.ts');
  });
}
bootstrap();

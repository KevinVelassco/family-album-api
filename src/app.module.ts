import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import appConfig from './config/app.config';
import appConfigSchema from './config/app.schema.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: appConfigSchema,
    }),

    TypeOrmModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (configService: ConfigType<typeof appConfig>) => {
        return {
          type: 'postgres',
          host: configService.database.host,
          port: configService.database.port,
          username: configService.database.user,
          password: configService.database.password,
          database: configService.database.database,
          autoLoadEntities: true,
          synchronize: false,
          logging: configService.database.log === 'yes',
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

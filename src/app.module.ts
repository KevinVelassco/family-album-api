import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from './config/app.config';
import appConfigSchema from './config/app.schema.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from './common/common.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LabelModule } from './modules/label/label.module';
import { GroupModule } from './modules/group/group.module';
import { GroupLabelModule } from './modules/group-label/group-label.module';
import { GroupRequestModule } from './modules/group-request/group-request.module';

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

    CommonModule,
    UserModule,
    AuthModule,
    LabelModule,
    GroupModule,
    GroupLabelModule,
    GroupRequestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

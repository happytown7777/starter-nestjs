import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiaryModule } from './diary/diary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { isAuthenticated } from './app.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { secret } from 'src/utils/constant';
import { join } from 'path/posix';
import { UserController } from './user/user.controller';
import { DiaryController } from './diary/diary.controller';
import { UserService } from './user/user.service';
import { DiaryService } from './diary/diary.service';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';
import { FamilyModule } from './family/family.module';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './settings/settings.module';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { MulterModule } from '@nestjs/platform-express';
import EmailService from './email/email.service';
import { SeedService } from './seed/seed.service';
import { entities } from './db-entitles';
import { ChatsController } from './chats/chats.controller';
import { ChatsService } from './chats/chats.service';
import { ChatsModule } from './chats/chats.module';
import { CommunityController } from './community/community.controller';
import { CommunityModule } from './community/community.module';
import { CommunityService } from './community/community.service';
import { ReminderModule } from './reminder/reminder.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOSTNAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT),
      entities,
      synchronize: true,
      // dropSchema: true
    }),
    MulterModule.register({
      dest: './public/uploads/',
    }),
    DiaryModule,
    UserModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '2h' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forFeature(entities),
    NotificationModule,
    FamilyModule,
    SettingsModule,
    ChatsModule,
    CommunityModule,
    ReminderModule,
  ],
  controllers: [AppController, UserController, DiaryController, SettingsController, FileController, ChatsController, CommunityController],
  providers: [AppService, UserService, DiaryService, SettingsService, FileService, EmailService, SeedService, ChatsService, CommunityService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude(
        ...[
          { path: '/auth/login', method: RequestMethod.POST },
          { path: '/auth/google-login', method: RequestMethod.POST },
          { path: '/auth/reset-password', method: RequestMethod.POST },
          { path: '/auth/verify-password-token', method: RequestMethod.POST },
          { path: '/auth/change-password', method: RequestMethod.POST },
          { path: '/auth/check-family', method: RequestMethod.POST },
          { path: '/auth/check-pin', method: RequestMethod.POST},
          { path: '/auth/signup', method: RequestMethod.POST },
          { path: '/auth/qrcode', method: RequestMethod.POST },
          { path: '/file/upload', method: RequestMethod.POST },
          { path: '/diary/topics', method: RequestMethod.GET },
          { path: '/uploads/(.*)', method: RequestMethod.GET },
        ]
      )
      .forRoutes('*');
  }
}

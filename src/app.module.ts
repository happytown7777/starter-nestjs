import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiaryModule } from './diary/diary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Diary } from './diary/entities/diary.entity';
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
import { DiaryTopic } from './diary/entities/diary-topic.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      // password: 'root',
      password: 'Xiah@1998123',
      database: 'haruhana',
      entities: [User, Diary, DiaryTopic],
      synchronize: true,
      // dropSchema: true
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
    TypeOrmModule.forFeature([User, Diary, DiaryTopic]),
    NotificationModule,
  ],
  controllers: [AppController, UserController, DiaryController],
  providers: [AppService, UserService, DiaryService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude(
        ...[
          { path: '/auth/login', method: RequestMethod.POST },
          { path: '/auth/google-login', method: RequestMethod.POST },
          { path: '/auth/signup', method: RequestMethod.POST },
          { path: '/diary/topics', method: RequestMethod.GET },
        ]
      )
      .forRoutes('*');
  }
}

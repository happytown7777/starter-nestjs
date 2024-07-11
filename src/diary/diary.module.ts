import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Diary } from './entities/diary.entity';
import { DiaryTopic } from './entities/diary-topic.entity';
import { DiaryLike } from './entities/diary-like.entity';
import { DiaryComment } from './entities/diary-comments.entity';
import { Chat } from 'src/chats/entities/chat.entity';
import { ChatGroup } from 'src/chats/entities/chat-group.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { Settings } from 'src/settings/entities/settings.entity';
import { SocketModule } from 'src/socket/socket.module';
import { DiaryUser } from './entities/diary-user.entity';

@Module({
  imports: [SocketModule, TypeOrmModule.forFeature([User, Diary, DiaryUser, DiaryTopic, DiaryLike, DiaryComment, Chat, ChatGroup, NotificationEntity, Settings])],
  providers: [DiaryService],
  controllers: [DiaryController]
})
export class DiaryModule { }

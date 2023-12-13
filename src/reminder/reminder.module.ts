import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ReminderService } from './reminder.service';
import { Chat } from 'src/chats/entities/chat.entity';
import { ChatGroup } from 'src/chats/entities/chat-group.entity';
import { Settings } from 'src/settings/entities/settings.entity';
import { Diary } from 'src/diary/entities/diary.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
    providers: [ReminderService],
    imports: [
        SocketModule,
        TypeOrmModule.forFeature([User, Chat, ChatGroup, Settings, Diary, NotificationEntity]),
    ]
})
export class ReminderModule { }

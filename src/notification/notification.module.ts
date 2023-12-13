import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ChatsService } from 'src/chats/chats.service';
import { ChatGroup } from 'src/chats/entities/chat-group.entity';
import { Chat } from 'src/chats/entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  imports: [
    SocketModule,
    TypeOrmModule.forFeature([NotificationEntity])
  ]
})
export class NotificationModule { }

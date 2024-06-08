import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { Chat } from './entities/chat.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [SocketModule, TypeOrmModule.forFeature([User, ChatGroup, Chat])],
  providers: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule { }

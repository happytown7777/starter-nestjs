import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { Chat } from './entities/chat.entity';
import { ChatGateway } from './chats.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatGroup, Chat])],
  providers: [ChatsService, ChatGateway],
  controllers: [ChatsController],
  exports: [ChatGateway],
})
export class ChatsModule { }

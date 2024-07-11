import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { ChatsService } from 'src/chats/chats.service';
import { Chat } from 'src/chats/entities/chat.entity';
import { ChatGroup } from 'src/chats/entities/chat-group.entity';
import { ChatGroupUser } from 'src/chats/entities/chat-group-user.entity';
import { ChatSetting } from 'src/chats/entities/chat-setting.entity';

@Global()
@Module({
    providers: [SocketGateway, ChatsService],
    exports: [SocketGateway],
    imports: [
        TypeOrmModule.forFeature([User, Chat, ChatGroup, ChatGroupUser, ChatSetting]),
    ]
})
export class SocketModule { }

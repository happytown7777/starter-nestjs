import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Repository } from 'typeorm';
import { ChatGroup } from './entities/chat-group.entity';
import { parse } from 'path';
import { User } from 'src/user/entities/user.entity';
import { ChatChannel } from './entities/chat-channel.entity';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async getAllChannels(auth_user: User): Promise<ChatChannel[]> {
        console.log(auth_user)
        const user = await this.userRepository.findOne({ where: { email: auth_user.email }, relations: ['family'] })
        const family_members = user.family.members;
        const channels = [];
        for (let i = 0; i < family_members.length; i++) {
            const element = family_members[i];
            if (element.email === user.email) continue;
            const lastMessage = await this.chatRepository.findOne({
                where: [
                    { fromId: user.id, toId: element.id },
                    { fromId: element.id, toId: user.id },
                ]
            });
            const unReadCount = await this.chatRepository.count({
                where: [
                    { fromId: user.id, toId: element.id, seen: false },
                    { fromId: element.id, toId: user.id, seen: false },
                ]
            });
            channels.push(new ChatChannel(element.id, element.fullName, [element], false, [], lastMessage, unReadCount));
        }
        return channels;
    }

    async getChannelInfo(auth_user: User, chatId: string, isGroup: Boolean): Promise<ChatChannel> {
        if (isGroup) {

        }
        else {
            const member = await this.userRepository.findOne({ where: { id: parseInt(chatId) }, relations: ['family'] })
            const messages = await this.chatRepository.find({
                where: [
                    { fromId: auth_user.id, toId: member.id },
                    { fromId: member.id, toId: auth_user.id },
                ],
                order: { createdAt: 'ASC' },
            })
            return new ChatChannel(member.id, member.fullName, [member], false, messages);
        }
    }

    async sendMessage(msg: Chat): Promise<Boolean> {
        const message = await this.chatRepository.create(msg);
        await this.chatRepository.save(message);
        return true;
    }
}

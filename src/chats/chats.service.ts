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
        @InjectRepository(ChatGroup) private chatGroupRepository: Repository<ChatGroup>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async getAllChannels(auth_user: User): Promise<ChatChannel[]> {
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
                ],
                order: { createdAt: 'DESC' },
            });
            const unReadCount = await this.chatRepository.count({
                where: [
                    { fromId: user.id, toId: element.id, seen: false },
                    { fromId: element.id, toId: user.id, seen: false },
                ]
            });
            channels.push(new ChatChannel(element.id, element.fullName, [element], false, [], lastMessage, unReadCount));
        }
        const groups = await this.chatGroupRepository.createQueryBuilder("chat_group")
            .innerJoinAndSelect("chat_group.users", "user")
            .where("user.id = :userId", { userId: user.id })
            .getMany();
        for (let i = 0; i < groups.length; i++) {
            const element = await this.chatGroupRepository.findOne({ where: { id: groups[i].id }, relations: ['users'] });
            const lastMessage = await this.chatRepository.findOne({
                where: [
                    { toId: element.id, isGroup: true },
                ],
                order: { createdAt: 'DESC' },
            });
            const unReadCount = await this.chatRepository.count({
                where: [
                    { toId: element.id, isGroup: true, seen: false },
                ]
            });
            channels.push(new ChatChannel(element.id, element.name, element.users, true, [], lastMessage, unReadCount, element.image));
        }
        return channels.sort((a, b) => (!a.lastMessage?.createdAt || a.lastMessage?.createdAt < b.lastMessage?.createdAt) ? 1 : -1);
    }

    async getChannelInfo(auth_user: User, chatId: string, isGroup: Boolean): Promise<ChatChannel> {
        if (isGroup) {
            const group = await this.chatGroupRepository.findOne({ where: { id: parseInt(chatId) }, relations: ['users'] })
            const messages = await this.chatRepository.find({
                where: [
                    { toId: group.id, isGroup: true },
                ],
                order: { createdAt: 'ASC' },
            })
            return new ChatChannel(group.id, group.name, group.users, true, messages, undefined, 0, group.image);
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

    async createChannel(auth_user: User, body: { name: string, members: User[], image?: string }): Promise<any> {
        const exsitsName = await this.chatGroupRepository.findOne({ where: { name: body.name } });
        if (exsitsName) return { success: false, error: 'Group subject already exists' };
        const newGroup = await this.chatGroupRepository.create({
            name: body.name,
            users: body.members,
            image: body.image,
        });
        newGroup.users.push(auth_user);
        await this.chatGroupRepository.save(newGroup);
        return { success: true };
    }

    async sendMessage(msg: Chat): Promise<Boolean> {
        const message = await this.chatRepository.create(msg);
        await this.chatRepository.save(message);
        return true;
    }

    async getGroupUsers(channelId: number): Promise<User[]> {
        const channel = await this.chatGroupRepository.findOne({ where: { id: channelId }, relations: ['users'] });
        return channel.users;
    }
}

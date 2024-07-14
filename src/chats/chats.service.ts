import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Not, Repository } from 'typeorm';
import { ChatGroup } from './entities/chat-group.entity';
import { User } from 'src/user/entities/user.entity';
import { ChatChannel } from './entities/chat-channel.entity';
import { Chat } from './entities/chat.entity';
import { ChatGroupUser } from './entities/chat-group-user.entity';
import { ChatSetting } from './entities/chat-setting.entity';


@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(ChatGroup) private chatGroupRepository: Repository<ChatGroup>,
        @InjectRepository(ChatGroupUser) private chatGroupUserRepository: Repository<ChatGroupUser>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(ChatSetting) private chatSettingRepository: Repository<ChatSetting>,
    ) { }

    async doesRecordExist(repository: any, conditions: any): Promise<boolean> {
        const record = await repository.findOne({ where: conditions });
        return record !== null;
    }

    async getAllChannels(auth_user: User): Promise<ChatChannel[]> {
        console.log("==============chatGroupUser===============", auth_user)
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
                    { fromId: element.id, toId: user.id, seen: false },
                ]
            });

            const pin = await this.doesRecordExist(this.chatSettingRepository, { userId: auth_user.id, relatedId: element.id, isGroup: false, type: 'pin' });
            const mute = await this.doesRecordExist(this.chatSettingRepository, { userId: auth_user.id, relatedId: element.id, isGroup: false, type: 'mute' });
            channels.push(new ChatChannel(element.id, element.fullName, [element], false, [], lastMessage, unReadCount, element.avatar, pin, mute));
        }
        const groups = await this.chatGroupRepository.createQueryBuilder("chat_group")
            .leftJoinAndSelect("chat_group.chatGroupUser", "cgu")
            .leftJoinAndSelect("cgu.user", "user")
            .where("user.id = :userId", { userId: user.id })
            .getMany();

        for (let i = 0; i < groups.length; i++) {
            const element = await this.chatGroupRepository.findOne({ where: { id: groups[i].id }, relations: ['chatGroupUser', 'chatGroupUser.user'] });

            if (!element) {
                console.error(`ChatGroup with id ${groups[i].id} not found`);
                continue;
            }

            const users = element.chatGroupUser.map(cgu => cgu.user);
            const lastMessage = await this.chatRepository.findOne({
                where: [
                    { toId: element.id, isGroup: true },
                ],
                order: { createdAt: 'DESC' },
            });
            const unReadCount = await this.chatRepository.count({
                where: [
                    { toId: element.id, fromId: Not(user.id), isGroup: true, seen: false },
                ]
            });
            const pin = await this.doesRecordExist(this.chatSettingRepository, { userId: auth_user.id, relatedId: groups[i].id, isGroup: true, type: 'pin' });
            const mute = await this.doesRecordExist(this.chatSettingRepository, { userId: auth_user.id, relatedId: groups[i].id, isGroup: true, type: 'mute' });
            channels.push(new ChatChannel(element.id, element.name, users, true, [], lastMessage, unReadCount, element.image, pin, mute));
        }


        return channels.sort((a, b) => (!a.lastMessage?.createdAt || a.lastMessage?.createdAt < b.lastMessage?.createdAt) ? 1 : -1);
    }

    async getChannelInfo(auth_user: User, chatId: string, isGroup: Boolean): Promise<ChatChannel> {
        if (isGroup) {
            const group = await this.chatGroupRepository.findOne({ where: { id: parseInt(chatId) }, relations: ['chatGroupUser', 'chatGroupUser.user'] })
            const users = group.chatGroupUser.map(cgu => cgu.user);
            const messages = await this.chatRepository.find({
                where: [
                    { toId: group.id, isGroup: true },
                ],
                order: { createdAt: 'ASC' },
            })
            return new ChatChannel(group.id, group.name, users, true, messages, undefined, 0, group.image);
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
        const exist = await this.chatGroupRepository.findOne({ where: { name: body.name } });
        if (exist) return { success: false, error: 'Group subject already exists' };
        const newGroup = await this.chatGroupRepository.create({
            name: body.name,
            image: body.image,
            userId: auth_user.id,
        });
        const savedGroup = await this.chatGroupRepository.save(newGroup);
        const chatGroupUser = body.members.map(member => {
            return this.chatGroupUserRepository.create({
                user: member,
                chatGroup: savedGroup,
            })
        })
        chatGroupUser.push(this.chatGroupUserRepository.create({
            user: auth_user,
            chatGroup: savedGroup,
        }))
        await this.chatGroupUserRepository.save(chatGroupUser)
        return { success: true };
    }

    async deleteChannel(id: number, userId: number): Promise<{ error?: string }> {
        const exist = await this.chatGroupUserRepository.findOne({ where: { chatGroupId: id, userId: userId } });
        if (exist) {
            await this.chatGroupUserRepository.delete({ chatGroupId: id, userId: userId });
            return {};
        }
        else {
            return { error: "No matching user channel" };
        }
    }

    async setPinChannel(userId: number, relatedId: number, isGroup: boolean): Promise<{ error?: string }> {
        const exist = await this.chatSettingRepository.findOne({ where: { userId: userId, relatedId: relatedId, isGroup: isGroup, type: 'pin' } });
        if (exist) {
            await this.chatSettingRepository.delete({ userId: userId, relatedId: relatedId, isGroup: isGroup, type: 'pin' });
            return {};
        }
        else {
            const saveData = this.chatSettingRepository.create({ userId: userId, relatedId: relatedId, isGroup: isGroup, type: 'pin' });
            await this.chatSettingRepository.save(saveData);
        }
    }

    async setMuteChannel(userId: number, relatedId: number, isGroup: boolean): Promise<{ error?: string }> {
        const exist = await this.chatSettingRepository.findOne({ where: { userId: userId, relatedId: relatedId, isGroup: isGroup, type: 'mute' } });
        if (exist) {
            await this.chatSettingRepository.delete({ userId: userId, relatedId: relatedId, isGroup: isGroup, type: 'mute' });
            return {};
        }
        else {
            const saveData = this.chatSettingRepository.create({ userId: userId, relatedId: relatedId, isGroup: isGroup, type: 'mute' });
            await this.chatSettingRepository.save(saveData);
        }
    }

    async sendMessage(msg: Chat): Promise<any> {
        const message = await this.chatRepository.create(msg);
        await this.chatRepository.save(message);
        return {
            ...message,
            from: await this.userRepository.findOne({ where: { id: msg.fromId } }),
            to: await this.userRepository.findOne({ where: { id: msg.toId } }),
        };
    }

    async deleteMessage(link: string): Promise<{ error?: string }> {
        const exist = await this.chatRepository.findOne({ where: { link: link } });
        if (exist) {
            await this.chatRepository.delete({ link: link });
            return {};
        }
        else {
            return { error: "No matching user channel" };
        }
    }


    async getGroupUsers(channelId: number): Promise<User[]> {
        const channel = await this.chatGroupRepository.findOne({ where: { id: channelId }, relations: ['chatGroupUser', 'chatGroupUser.user'] });
        const users = channel.chatGroupUser.map(cgu => cgu.user);
        return users.filter(user => user.id != channel.id);
    }

    async readMessage(toId: number, fromId: number, isGroup: boolean): Promise<void> {
        if (isGroup) {
            await this.chatRepository.update({ isGroup: true, toId: fromId, fromId: Not(toId) }, { seen: true });
        }
        else {
            await this.chatRepository.update({ toId, fromId }, { seen: true });
        }
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Not, Repository } from 'typeorm';
import { Diary } from './entities/diary.entity';
import { DiaryLike } from './entities/diary-like.entity';
import { DiaryComment } from './entities/diary-comments.entity';
import { User } from 'src/user/entities/user.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { Settings } from 'src/settings/entities/settings.entity';
import { DiaryUser } from './entities/diary-user.entity';

@Injectable()
export class DiaryService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(DiaryTopic) private diaryTopicRepository: Repository<DiaryTopic>,
        @InjectRepository(DiaryLike) private diaryLikeRepository: Repository<DiaryLike>,
        @InjectRepository(Diary) private diaryRepository: Repository<Diary>,
        @InjectRepository(DiaryUser) private diaryUserRepository: Repository<DiaryUser>,
        @InjectRepository(DiaryComment) private diaryCommentRepository: Repository<DiaryComment>,
        @InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
        private socketGateway: SocketGateway,
    ) { }

    async getAllTopics(familyId: number): Promise<any[]> {
        const diaryTopics = await this.diaryTopicRepository.find({});

        // Fetch counts of Diaries for each DiaryTopic
        const topics = await Promise.all(diaryTopics.map(async diaryTopic => {
            const count = await this.diaryUserRepository.createQueryBuilder('diaryUser')
                .leftJoinAndSelect('diaryUser.diary', 'diary')
                .leftJoinAndSelect('diary.diaryTopic', 'diaryTopic')
                .leftJoinAndSelect('diaryUser.user', 'user')
                .select('COUNT(diary.id)', 'count')
                .where('user.familyId = :familyId', { familyId })
                .andWhere('diary.diaryTopicId = :diaryTopicId', { diaryTopicId: diaryTopic.id })
                .groupBy('diary.diaryTopicId')
                .getRawOne();

            return {
                id: diaryTopic.id,
                name: diaryTopic.name,
                description: diaryTopic.description,
                count: count ? count.count : 0  // If count is null (no diaries), default to 0
            };
        }));
        return topics;
    }

    async getDiaryList(user: any, param: any = {}): Promise<Diary[]> {
        let query = this.diaryRepository.createQueryBuilder('diary')
            .leftJoinAndSelect('diary.diaryTopic', 'diaryTopic')
            .leftJoinAndSelect('diary.likes', 'likes')
            .leftJoinAndSelect('diary.diaryUser', 'du')
            .leftJoinAndSelect('du.user', 'user')
            .loadRelationCountAndMap('diary.commentCount', 'diary.comments')
            .where('user.id = :userId', { userId: user.id });
        if (param.searchKey) {
            // check title or content contains searchKey
            query = query.andWhere('(diary.title LIKE :searchKey OR diary.content LIKE :searchKey)', { searchKey: `%${param.searchKey}%` });
        }
        if (param.startDate && param.endDate) {
            query = query.andWhere('diary.date BETWEEN :startDate AND :endDate', { startDate: param.startDate, endDate: param.endDate });
        }
        if (param.withComments) {
            query = query.leftJoinAndSelect('diary.comments', 'comments').leftJoinAndSelect('comments.user', 'commentUser');
        }
        if (param.topicFilter) {
            query = query.andWhere('diary.diaryTopicId = :topicId', { topicId: param.topicFilter });
        }
        if (param.sortBy == 'trending') {
            query = query.addSelect('COUNT(likes.id)', 'likesCount')
                .groupBy('diary.id')
                .groupBy('diary.id')
                .orderBy('likesCount', 'DESC');
        }
        else {
            query = query.orderBy('diary.date', 'DESC');
        }
        const result = await query.getMany();
        return result;
    }

    async getDiaryData(diaryId: any, userId: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const result = await this.diaryRepository.findOne({ where: { id: diaryId }, relations: ['diaryTopic', 'likes', 'comments', 'diaryUser', 'user'] });
        const exist = result.diaryUser.find(diaryUser => diaryUser.userId === user.id);
        if (exist) {
            return { diary: result };
        } else {
            return { error: "Not Allowed" };
        }
    }

    async postDiary(diary: any, auth_user: User): Promise<any> {
        try {
            const topic = await this.diaryTopicRepository.findOneBy({ id: parseInt(diary['topicId']) });
            if (!topic) return { success: false, error: 'Topic does not exist.' }
            const diaryBody = this.diaryRepository.create({
                title: diary['title'],
                content: diary['content'],
                date: diary['date'],
                imageUrl: diary['imageUrl'],
                diaryTopic: topic,
                isSecret: diary['isSecret'],
                userId: auth_user.id,
            });
            const savedDiary = await this.diaryRepository.save(diaryBody);
            const diaryUsers = [];
            diaryUsers.push(this.diaryUserRepository.create({
                user: auth_user,
                diary: savedDiary,
            }))

            await this.diaryUserRepository.save(diaryUsers);

            const familyMemebers = await this.userRepository.find({ where: { familyId: auth_user.familyId, id: Not(auth_user.id) } });
            familyMemebers.forEach(async member => {
                const settings = await this.settingsRepository.findOne({ where: { userId: member.id } });
                console.log(settings, member)
                if (settings?.allowEveryonePost && settings?.allowFamilyNotification) {
                    this.notificationRepository.save({
                        userId: member.id,
                        type: 'diary',
                        title: `${auth_user.customName ?? auth_user.firstName} posted new diary`,
                        content: `${auth_user.customName ?? auth_user.firstName} added new diary <b>${diary.title}</b>`,
                        url: `/diary/view/${diary.id}`,
                    });
                    this.socketGateway.emitEvents(member.id.toString(), 'notification', {
                        title: `${auth_user.customName ?? auth_user.firstName} added new diary`,
                        content: `${auth_user.customName ?? auth_user.firstName} added new diary ${diary.title}`
                    });
                }
            });
            return;
        } catch (err) {
            return { error: err.message };
        }
    }


    async editDiary(diary: any, user: User): Promise<any> {
        try {
            const topic = await this.diaryTopicRepository.findOneBy({ id: parseInt(diary['topicId']) });
            const diaryBody = {
                title: diary['title'],
                content: diary['content'],
                imageUrl: diary['imageUrl'],
                user: user,
                diaryTopic: topic,
            }
            if (topic) {
                this.diaryRepository.update({ id: diary['id'] }, diaryBody);
            }
            return;
        } catch (err) {
            return { error: err.message };
        }
    }


    async updateDiary(body: any, userId: number): Promise<any> {
        console.log("=============updateDiary=========", body)
        const diary = await this.diaryRepository.findOne({ where: { id: body.id } });
        if (!diary) {
            return { error: 'Diary not found' };
        }
        else {
            await this.diaryRepository.update({ id: body.id }, body);
            return { success: true };
        }
    }


    async likeDiary(diaryId: any, userId: number): Promise<void> {
        const exist = await this.diaryLikeRepository.findOne({ where: { userId, diaryId } });
        if (exist) {
            await this.diaryLikeRepository.delete({ userId, diaryId });
        }
        else {
            await this.diaryLikeRepository.save({ userId, diaryId });
        }
    }

    async deleteDiary(id: any, userId: number): Promise<{ error?: string }> {
        const exist = await this.diaryRepository.findOne({ where: { id, diaryUser: { userId } } });
        if (!exist) {
            return { error: "No matching diary. Please check details." };
        }
        await this.diaryLikeRepository.delete({ diaryId: id });
        await this.diaryRepository.delete({ id, userId });
        return {};
    }

    async addDiaryComment(id: any, userId: number, parentId: number, comment: string): Promise<{ error?: string }> {
        await this.diaryCommentRepository.save({
            userId,
            diaryId: id,
            parentId,
            comment,
        });
        const diary = await this.diaryRepository.findOne({ where: { id }, relations: ['diaryUser', 'diaryUser.user'] });
        if (!diary) {
            return { error: 'Diary not found' };
        }
        for (const diaryUser of diary.diaryUser) {
            if (diaryUser.user.id !== userId) {
                const settings = await this.settingsRepository.findOne({ where: { userId: diaryUser.userId } });
                if (settings?.allowEveryonePost && settings?.allowMessageNotification) {
                    await this.notificationRepository.save({
                        userId: diaryUser.userId,
                        type: 'comment',
                        title: `Commented to your diary`,
                        content: `${diaryUser.user.customName ?? diaryUser.user.firstName} commented on your diary <b>${diary.title}</b>. Comment is <i>${comment.slice(0, 25)}${comment.length > 25 ? '...' : ''}</i>`,
                        url: `/diary/view/${diary.id}`,
                    });
                    this.socketGateway.emitEvents(diaryUser.userId.toString(), 'notification', {
                        title: `${diaryUser.user.customName ?? diaryUser.user.firstName} commented on your diary`,
                        content: `${diaryUser.user.customName ?? diaryUser.user.firstName} commented on your diary ${diary.title}. Comment is ${comment.slice(0, 25)}${comment.length > 25 ? '...' : ''}`
                    });
                }
            }
        }
        return { error: '' }
    }

    async removeDiaryComment(id: number, userId: number): Promise<{ error?: string }> {
        let diaryComment = await this.diaryCommentRepository.findOne({ where: { id, userId } });

        if (!diaryComment) {
            return { error: 'No matching comment. Please check details.' }
        }

        const deleteCommentAndChildren = async (parentId: number | null) => {
            const commentList = await this.diaryCommentRepository.find({ where: { parentId } });
            for (const comment of commentList) {
                await deleteCommentAndChildren(comment.id)
                await this.diaryCommentRepository.delete({ id: comment.id });
            }
        }

        await deleteCommentAndChildren(id);
        await this.diaryCommentRepository.delete({ id })
    }

    async getUserDiaryList(userId, familyId, param: any = {}): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user.familyId !== familyId) {
            return { error: 'Not Allowed' }
        }

        let query = this.diaryRepository.createQueryBuilder('diary')
            .leftJoinAndSelect('diary.diaryTopic', 'diaryTopic')
            .leftJoinAndSelect('diary.likes', 'likes')
            .loadRelationCountAndMap('diary.commentCount', 'diary.comments')
            .where('diary.userId = :userId', { userId: userId });
        if (param.withComments) {
            query = query.leftJoinAndSelect('diary.comments', 'comments').leftJoinAndSelect('comments.user', 'commentUser');
        }
        if (param.topicFilter) {
            query = query.andWhere('diary.diaryTopicId = :topicId', { topicId: param.topicFilter });
        }
        if (param.sortBy == 'trending') {
            query = query.addSelect('COUNT(likes.id)', 'likesCount')
                .groupBy('diary.id')
                .groupBy('diary.id')
                .orderBy('likesCount', 'DESC');
        }
        else {
            query = query.orderBy('diary.date', 'DESC');
        }
        const result = await query.getMany();
        return { diaryList: result };
    }


    async shareDiary(auth_user: User, body: { diaryId: number, members: User[] }): Promise<any> {
        const exist = await this.diaryRepository.findOne({ where: { id: body.diaryId } });
        if (!exist) return { success: false, error: 'Diary does not exists.' };

        const existingUsers = await this.diaryUserRepository.find({ where: { diaryId: body.diaryId } });
        const existingUserIds = new Set(existingUsers.map(existingUser => existingUser.userId));

        const newDiaryUsers = body.members
            .filter(member => !existingUserIds.has(member.id))
            .map(member => {
                return this.diaryUserRepository.create({
                    diaryId: body.diaryId,
                    user: member,
                })
            })

        if (newDiaryUsers.length > 0) {
            await this.diaryUserRepository.save(newDiaryUsers)
        }
        return { success: true };
    }
}

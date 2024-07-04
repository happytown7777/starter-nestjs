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

@Injectable()
export class DiaryService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(DiaryTopic) private diaryTopicRepository: Repository<DiaryTopic>,
        @InjectRepository(DiaryLike) private diaryLikeRepository: Repository<DiaryLike>,
        @InjectRepository(Diary) private diaryRepository: Repository<Diary>,
        @InjectRepository(DiaryComment) private diaryCommentRepository: Repository<DiaryComment>,
        @InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
        private socketGateway: SocketGateway,
    ) { }

    async getAllTopics(familyId: number): Promise<any[]> {
        const diaryTopics = await this.diaryTopicRepository.find({});

        // Fetch counts of Diaries for each DiaryTopic
        const topics = await Promise.all(diaryTopics.map(async diaryTopic => {
            const count = await this.diaryRepository.createQueryBuilder('diary')
                .leftJoin('diary.diaryTopic', 'diaryTopic')
                .leftJoin(User, 'user', 'diary.userId = user.id')
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
            .loadRelationCountAndMap('diary.commentCount', 'diary.comments')
            .where('diary.userId = :userId', { userId: user.id });
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

    async getDiaryData(diaryId, userId): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const result = await this.diaryRepository.findOne({ where: { id: diaryId }, relations: ['diaryTopic', 'likes', 'comments'] });
        if (result.user.familyId !== user.familyId) {
            return { error: "Not Allowed" };
        }
        return { diary: result };
    }

    async postDiary(diary, user): Promise<string> {
        try {
            const topic = await this.diaryTopicRepository.findOneBy({ id: parseInt(diary['topicId']) });
            const diaryBody = {
                title: diary['title'],
                content: diary['content'],
                date: diary['date'],
                imageUrl: diary['imageUrl'],
                user: user,
                diaryTopic: topic,
            }
            if (topic) {
                this.diaryRepository.save(diaryBody);
            }
            const familyMemebers = await this.userRepository.find({ where: { familyId: user.familyId, id: Not(user.id) } });
            familyMemebers.forEach(async member => {
                const settings = await this.settingsRepository.findOne({ where: { userId: member.id } });
                console.log(settings, member)
                if (settings?.allowEveryonePost && settings?.allowFamilyNotification) {
                    this.notificationRepository.save({
                        userId: member.id,
                        type: 'diary',
                        title: `${user.customName ?? user.firstName} posted new diary`,
                        content: `${user.customName ?? user.firstName} added new diary <b>${diary.title}</b>`,
                        url: `/diary/view/${diary.id}`,
                    });
                    this.socketGateway.emitEvents(member.id.toString(), 'notification', {
                        title: `${user.customName ?? user.firstName} added new diary`,
                        content: `${user.customName ?? user.firstName} added new diary ${diary.title}`
                    });
                }
            });
            return;
        } catch (err) {
            return err.message;
        }
    }


    async editDiary(diary, user): Promise<string> {
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
            return err.message;
        }
    }

    async likeDiary(diaryId, userId): Promise<void> {
        const exist = await this.diaryLikeRepository.findOne({ where: { userId, diaryId } });
        if (exist) {
            await this.diaryLikeRepository.delete({ userId, diaryId });
        }
        else {
            await this.diaryLikeRepository.save({ userId, diaryId });
        }
    }

    async deleteDiary(id, userId): Promise<{ error?: string }> {
        const exist = await this.diaryRepository.findOne({ where: { userId, id, } });
        if (exist) {
            await this.diaryLikeRepository.delete({ diaryId: id });
            await this.diaryRepository.delete({ userId, id });
            return {};
        }
        else {
            return { error: "No matching diary. Please check details." };
        }
    }

    async addDiaryComment(id, userId, parentId, comment): Promise<{ error?: string }> {
        await this.diaryCommentRepository.save({
            userId,
            diaryId: id,
            parentId,
            comment,
        });
        const diary = await this.diaryRepository.findOne({ where: { id } });
        if (diary.userId.toString() !== userId.toString()) {
            const settings = await this.settingsRepository.findOne({ where: { userId: diary.userId } });
            if (settings?.allowEveryonePost && settings?.allowMessageNotification) {
                await this.notificationRepository.save({
                    userId: diary.userId,
                    type: 'comment',
                    title: `Commented to your diary`,
                    content: `${diary.user.customName ?? diary.user.firstName} commented on your diary <b>${diary.title}</b>. Comment is <i>${comment.slice(0, 25)}${comment.length > 25 ? '...' : ''}</i>`,
                    url: `/diary/view/${diary.id}`,
                });
                this.socketGateway.emitEvents(diary.userId.toString(), 'notification', {
                    title: `${diary.user.customName ?? diary.user.firstName} commented on your diary`,
                    content: `${diary.user.customName ?? diary.user.firstName} commented on your diary ${diary.title}. Comment is ${comment.slice(0, 25)}${comment.length > 25 ? '...' : ''}`
                });
            }
        }
        return { error: '' }
    }

    async removeDiaryComment(id, userId): Promise<{ error?: string }> {
        let diaryComment = await this.diaryCommentRepository.findOne({
            where: {
                id,
                userId,
            }
        });
        if (diaryComment) {
            await this.diaryCommentRepository.delete({ id });
            return { error: '' }
        }
        else {
            return { error: 'No matching comment. Please check details.' }
        }
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


}

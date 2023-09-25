import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Repository } from 'typeorm';
import { Diary } from './entities/diary.entity';
import { parse } from 'path';
import { DiaryLike } from './entities/diary-like.entity';
import { DiaryComment } from './entities/diary-comments.entity';

@Injectable()
export class DiaryService {
    constructor(
        @InjectRepository(DiaryTopic) private diaryTopicRepository: Repository<DiaryTopic>,
        @InjectRepository(DiaryLike) private diaryLikeRepository: Repository<DiaryLike>,
        @InjectRepository(Diary) private diaryRepository: Repository<Diary>,
        @InjectRepository(DiaryComment) private diaryCommentRepository: Repository<DiaryComment>,
    ) { }

    async getAllTopics(): Promise<DiaryTopic[]> {
        return await this.diaryTopicRepository.find({});
    }

    async getDiaryList(userData, param: any = {}): Promise<Diary[]> {
        let query = this.diaryRepository.createQueryBuilder('diary')
            .leftJoinAndSelect('diary.diaryTopic', 'diaryTopic')
            .leftJoinAndSelect('diary.likes', 'likes')
            .loadRelationCountAndMap('diary.commentCount', 'diary.comments')
            .where('diary.userId = :userId', { userId: userData.id });
        if (param.withComments) {
            query = query.leftJoinAndSelect('diary.comments', 'comments')
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
        console.log(query.getQuery());
        const result = await query.getMany();
        return result;
    }

    async getDiaryData(diaryId): Promise<Diary> {
        const result = await this.diaryRepository.findOne({ where: { id: diaryId }, relations: ['diaryTopic', 'likes', 'comments'] });
        return result;
    }

    async postDiary(diary, user): Promise<string> {
        try {
            const topic = await this.diaryTopicRepository.findOneBy({ id: parseInt(diary['topicId']) });
            const diaryBody = {
                content: diary['content'],
                date: diary['date'],
                imageUrl: diary['imageUrl'],
                user: user,
                diaryTopic: topic,
            }
            if (topic) {
                this.diaryRepository.save(diaryBody);
            }
            return;
        } catch (err) {
            return err.message;
        }
    }

    async editDiary(diary, user): Promise<string> {
        try {
            console.log(diary);
            const topic = await this.diaryTopicRepository.findOneBy({ id: parseInt(diary['topicId']) });
            const diaryBody = {
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
        return { error: '' }
    }

}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Repository } from 'typeorm';
import { Diary } from './entities/diary.entity';
import { parse } from 'path';

@Injectable()
export class DiaryService {
    constructor(
        @InjectRepository(DiaryTopic) private diaryTopicRepository: Repository<DiaryTopic>,
        @InjectRepository(Diary) private diaryRepository: Repository<Diary>,
    ) { }

    async getAllTopics(): Promise<DiaryTopic[]> {
        return await this.diaryTopicRepository.find({});
    }

    async getDiaryList(userData): Promise<Diary[]> {
        const result = await this.diaryRepository.find({where: { user: userData.id }, order: { date: 'DESC' }});
        return result;
    }

    async postDiary(values, user): Promise<string> {
        try {
            Object.keys(values).forEach(async key => {
                if (!parseInt(key)) return;
                const topic = await this.diaryTopicRepository.findOneBy({ id: parseInt(key) });
                const diaryBody = {
                    content: values[key],
                    date: values.date,
                    user: user,
                    diaryTopic: topic,
                }
                if (topic && values[key]) {
                    this.diaryRepository.save(diaryBody);
                }
            });
            return;
        } catch (err) {
            return err.message;
        }
    }
}

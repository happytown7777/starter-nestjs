import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(DiaryTopic) private readonly topicRepository: Repository<DiaryTopic>,
    ) { }

    async seedDatabase() {
        await this.seedUsers();
    }

    async seedUsers() {
        const users = [
            { fullName: 'Dev Parent', username: 'dev_parent', birthdate: '1980-01-01', email: 'dev-parent@email.com', password: 'password' },
            { fullName: 'Dev Child', username: 'dev_child', birthdate: '2010-01-01', email: 'dev-child@email.com', password: 'password' },
        ];

        for (const user of users) {
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(user.password, salt);
            const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
            if (!existingUser) {
                await this.userRepository.save({
                    ...user,
                    password: hash,
                });
            }
        }

    }
    
    async seedTopics() {
        const topics = [
            { name: 'Emotion', description: 'Emotion', imgUrl: '/emotion.jpg' },
            { name: 'Happiness', description: 'Happiness', imgUrl: '/happiness.jpg' },
            { name: 'Gratitude', description: 'Gratitude', imgUrl: '/gratitude.jpg' },
            { name: 'Hope', description: 'Hope', imgUrl: '/hope.jpg' },
        ];

        for (const topic of topics) {
            const existingTopic = await this.topicRepository.findOne({ where: { name: topic.name } });
            if (!existingTopic) {
                await this.topicRepository.save(topic);
            }
        }

    }
}

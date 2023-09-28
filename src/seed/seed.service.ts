import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Roles } from 'src/user/entities/roles.entity';
import { Family } from 'src/family/entities/family.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(DiaryTopic) private readonly topicRepository: Repository<DiaryTopic>,
        @InjectRepository(Roles) private readonly roleRepository: Repository<Roles>,
        @InjectRepository(Family) private readonly familyRepository: Repository<Family>,
    ) { }

    async seedDatabase() {
        await this.seedRoles();
        await this.seedFamilies();
        await this.seedUsers();
        await this.seedTopics();
    }

    async seedUsers() {
        const users = [
            { firstName: 'Dev', lastName: 'Parent', username: 'dev_parent', birthdate: '1980-01-01', email: 'dev-parent@email.com', password: 'password', role_id: 1, family_id: 1, },
            { firstName: 'Dev', lastName: 'Child', username: 'dev_child', birthdate: '2010-01-01', email: 'dev-child@email.com', password: 'password', role_id: 2, family_id: 1, },
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
            { name: 'Dreams & Wishes', description: 'Hope', imgUrl: '/hope.jpg' },
        ];

        for (const topic of topics) {
            const existingTopic = await this.topicRepository.findOne({ where: { name: topic.name } });
            if (!existingTopic) {
                await this.topicRepository.save(topic);
            }
            else {
                await this.topicRepository.update(existingTopic.id, topic);
            }
        }

    }
    
    async seedRoles() {
        const roles = [
            { role: 'Parent' },
            { role: 'Child' },
            { role: 'Admin' },
        ];

        for (const role of roles) {
            const existingRole = await this.roleRepository.findOne({ where: { role: role.role } });
            if (!existingRole) {
                await this.roleRepository.save(role);
            }
            else {
                await this.roleRepository.update(existingRole.id, role);
            }
        }

    }
    
    async seedFamilies() {
        const families = [
            { name: 'Test Family', 'description': 'It is a test family' },
        ];

        for (const family of families) {
            const existingFamily = await this.familyRepository.findOne({ where: { name: family.name } });
            if (!existingFamily) {
                await this.familyRepository.save(family);
            }
            else {
                await this.familyRepository.update(existingFamily.id, family);
            }
        }

    }
}
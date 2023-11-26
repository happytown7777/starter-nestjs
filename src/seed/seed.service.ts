import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { DiaryTopic } from 'src/diary/entities/diary-topic.entity';
import { Roles } from 'src/user/entities/roles.entity';
import { Family } from 'src/family/entities/family.entity';
import { CommunityForum } from 'src/community/entities/community-forum.entity';
import { CommunitySubforum } from 'src/community/entities/community-subforum.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(DiaryTopic) private readonly topicRepository: Repository<DiaryTopic>,
        @InjectRepository(Roles) private readonly roleRepository: Repository<Roles>,
        @InjectRepository(Family) private readonly familyRepository: Repository<Family>,
        @InjectRepository(CommunityForum) private readonly forumRepository: Repository<CommunityForum>,
        @InjectRepository(CommunitySubforum) private readonly subforumRepository: Repository<CommunitySubforum>,
    ) { }

    async seedDatabase() {
        await this.seedRoles();
        await this.seedFamilies();
        await this.seedUsers();
        await this.seedTopics();
        await this.seedForums();
        await this.seedSubforums();
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
            { name: 'Wishes', description: 'Wishes', imgUrl: '/hope.jpg' },
            { name: 'Future me', description: 'Future me', imgUrl: '/hope.jpg' },
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

    async seedForums() {
        const forums = [
            { title: 'Family Diaries Sharing' },
            { title: 'Parenting Discussions' },
            { title: 'Marriage and Relationships' },
            { title: 'Education and Learning' },
            { title: 'Health and Wellness' },
            { title: 'Leisure and Entertainment' },
            { title: 'Community Support and Advice' },
            { title: 'Tech and Media for Families' },
        ];

        for (const forum of forums) {
            const existingForum = await this.forumRepository.findOne({ where: { title: forum.title } });
            if (!existingForum) {
                await this.forumRepository.save(forum);
            }
        }

    }

    async seedSubforums() {
        const subforums = [
            { title: 'Daily Family Life', description: 'Share and discuss daily family activities and experiences.', forum: 'Family Diaries Sharing' },
            { title: 'Special Moments', description: 'Document and discuss special occasions, milestones, and celebrations.', forum: 'Family Diaries Sharing' },
            { title: 'Early Childhood', description: 'Discussions on parenting infants and toddlers.', forum: 'Parenting Discussions' },
            { title: 'School-Age Children', description: 'Focus on school-related topics and parenting school-age kids.', forum: 'Parenting Discussions' },
            { title: 'Teen Parenting', description: 'Challenges and joys of parenting teenagers.', forum: 'Parenting Discussions' },
            { title: 'Special Needs', description: 'Support and advice for parents of children with special needs.', forum: 'Parenting Discussions' },
            { title: 'Communication', description: 'Strengthening couple communication and relationship.', forum: 'Marriage and Relationships' },
            { title: 'Work-Life Balance', description: 'Managing family life with work responsibilities.', forum: 'Marriage and Relationships' },
            { title: 'Relationship Challenges', description: 'Support for relationship difficulties and solutions.', forum: 'Marriage and Relationships' },
            { title: 'Home Schooling', description: 'Sharing resources and experiences about homeschooling.', forum: 'Education and Learning' },
            { title: 'Educational Resources', description: 'Discussing educational tools, books, and online resources.', forum: 'Education and Learning' },
            { title: 'Parental Involvement', description: 'Strategies for being involved in your child’s education.', forum: 'Education and Learning' },
            { title: 'Family Health', description: 'Discussing physical and mental health issues for the whole family.', forum: 'Health and Wellness' },
            { title: 'Nutrition and Fitness', description: 'Sharing tips on healthy eating and staying active as a family.', forum: 'Health and Wellness' },
            { title: 'Family Travel', description: 'Sharing travel experiences and tips.', forum: 'Leisure and Entertainment' },
            { title: 'Hobbies and Activities', description: 'Discussing family hobbies and activities.', forum: 'Leisure and Entertainment' },
            { title: 'Book and Movie Club', description: 'Family-friendly book and movie discussions.', forum: 'Leisure and Entertainment' },
            { title: 'General Advice', description: 'A place to seek and give advice on various family matters.', forum: 'Community Support and Advice' },
            { title: 'Local Community Events', description: 'Sharing local events and meetups for families.', forum: 'Community Support and Advice' },
            { title: 'Educational Apps and Games', description: 'Discussing and recommending educational media for kids.', forum: 'Tech and Media for Families' },
            { title: 'Online Safety', description: 'Conversations about keeping kids safe online.', forum: 'Tech and Media for Families' },
        ];

        for (const subforum of subforums) {
            const parentForum = await this.forumRepository.findOne({ where: { title: subforum.forum } });
            if (parentForum) {
                const existingSubforum = await this.subforumRepository.findOne({ where: { title: subforum.title, forum: parentForum } });
                if (!existingSubforum) {
                    await this.subforumRepository.save({
                        title: subforum.title,
                        description: subforum.description,
                        forum: parentForum,
                    });
                }
            }
        }

    }

}

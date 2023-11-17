import { Injectable } from '@nestjs/common';
import { CommunityForum } from './entities/community-forum.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CommunitySubforum } from './entities/community-subforum.entity';
import { CommunityThread } from './entities/community-thread.entity';
import { User } from 'src/user/entities/user.entity';
import { ThreadLike } from './entities/thread-like.entity';
import { ThreadView } from './entities/thread-view.entity';
import { ThreadComment } from './entities/thread-comments.entity';

@Injectable()
export class CommunityService {
    constructor(
        @InjectRepository(CommunityForum) private forumRepository: Repository<CommunityForum>,
        @InjectRepository(CommunitySubforum) private subforumRepository: Repository<CommunitySubforum>,
        @InjectRepository(CommunityThread) private threadRepository: Repository<CommunityThread>,
        @InjectRepository(ThreadLike) private threadLikeRepository: Repository<ThreadLike>,
        @InjectRepository(ThreadComment) private threadCommentRepository: Repository<ThreadComment>,
        @InjectRepository(ThreadView) private threadViewRepository: Repository<ThreadView>,
    ) { }

    async getForumList(forum_id?: string): Promise<CommunityForum[]> {
        return await this.forumRepository.find(forum_id ? { where: { id: parseInt(forum_id) }, relations: ['subforums'] } : { relations: ['subforums'] });
    }

    async searchThreads(searchKey?: string): Promise<CommunityThread[]> {
        return await this.threadRepository.find({ where: { title: Like(`%${searchKey}%`) } });
    }

    async getSubforumData(subforum_id: string, sortBy?: string, searchKey?: string): Promise<CommunitySubforum> {
        const subforum = await this.subforumRepository.findOne({ where: { id: parseInt(subforum_id) }, relations: ['threads'] });
        if (searchKey) {
            subforum.threads = subforum.threads.filter(thread => thread.title.toLowerCase().includes(searchKey.toLowerCase()));
        }
        if (sortBy === 'recent') {
            subforum.threads?.sort((a, b) => {
                return a.createdAt > b.createdAt ? -1 : 1;
            });
        }
        if (sortBy === 'popularity') {
            subforum.threads?.sort((a, b) => {
                return a.likes.length > b.likes.length ? -1 : 1;
            });
        }
        if (sortBy === 'views') {
            subforum.threads?.sort((a, b) => {
                return a.views.length > b.views.length ? -1 : 1;
            });
        }
        if (sortBy === 'replies') {
            subforum.threads?.sort((a, b) => {
                return a.comments.length > b.comments.length ? -1 : 1;
            });
        }
        return subforum;
    }

    async getThreadData(threadId: string): Promise<CommunityThread> {
        return await this.threadRepository.findOne({ where: { id: parseInt(threadId) } });
    }

    async postThread(thread: any, user: User): Promise<any> {
        const subforum = await this.subforumRepository.findOneBy({ id: parseInt(thread['subforumId']) });
        if (!subforum) return { error: 'Invaid Access' };
        const threadBody = {
            title: thread['title'],
            content: thread['content'],
            link: thread['link'],
            filename: thread['filename'],
            user: user,
            subforum: subforum,
        }
        await this.threadRepository.save(threadBody);
        return threadBody;
    }

    async likeThread(threadId, userId): Promise<void> {
        const exist = await this.threadLikeRepository.findOne({ where: { userId, threadId } });
        if (exist) {
            await this.threadLikeRepository.delete({ userId, threadId });
        }
        else {
            await this.threadLikeRepository.save({ userId, threadId });
        }
    }

    async addThreadComment(id, userId, parentId, comment): Promise<{ error?: string }> {
        await this.threadCommentRepository.save({
            userId,
            threadId: id,
            parentId,
            comment,
        });
        return { error: '' }
    }

    async removeThreadComment(id, userId): Promise<{ error?: string }> {
        let diaryComment = await this.threadCommentRepository.findOne({
            where: {
                id,
                userId,
            }
        });
        if (diaryComment) {
            await this.threadCommentRepository.delete({ id });
            return { error: '' }
        }
        else {
            return { error: 'No matching comment. Please check details.' }
        }
    }

}

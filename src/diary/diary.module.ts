import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Diary } from './entities/diary.entity';
import { DiaryTopic } from './entities/diary-topic.entity';
import { DiaryLike } from './entities/diary-like.entity';
import { DiaryComment } from './entities/diary-comments.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User, Diary, DiaryTopic, DiaryLike, DiaryComment])],
  providers: [DiaryService],
  controllers: [DiaryController]
})
export class DiaryModule {}

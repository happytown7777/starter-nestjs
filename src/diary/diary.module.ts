import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Diary } from './entities/diary.entity';
import { DiaryTopic } from './entities/diary-topic.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User, Diary, DiaryTopic])],
  providers: [DiaryService],
  controllers: [DiaryController]
})
export class DiaryModule {}

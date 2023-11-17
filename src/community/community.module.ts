import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityForum } from './entities/community-forum.entity';
import { CommunitySubforum } from './entities/community-subforum.entity';
import { CommunityThread } from './entities/community-thread.entity';
import { ThreadLike } from './entities/thread-like.entity';
import { ThreadComment } from './entities/thread-comments.entity';
import { CommunityController } from './community.controller';
import { ThreadView } from './entities/thread-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityForum, CommunitySubforum, CommunityThread, ThreadLike, ThreadComment, ThreadView])],
  providers: [CommunityService],
  controllers: [CommunityController]
})
export class CommunityModule { }

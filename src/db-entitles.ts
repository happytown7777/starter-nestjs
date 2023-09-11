import { DiaryLike } from './diary/entities/diary-like.entity';
import { UserEmotions } from './user/entities/userEmotions.entity';
import { Settings } from './settings/entities/settings.entity';
import { Family } from './family/entities/family.entity';
import { DiaryTopic } from './diary/entities/diary-topic.entity';
import { Diary } from './diary/entities/diary.entity';
import { User } from './user/entities/user.entity';

export const entities = [
    User,
    Diary,
    DiaryTopic,
    Family,
    Settings,
    UserEmotions,
    DiaryLike,
]
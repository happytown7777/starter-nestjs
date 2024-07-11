import { DiaryLike } from './diary/entities/diary-like.entity';
import { UserEmotions } from './user/entities/userEmotions.entity';
import { Settings } from './settings/entities/settings.entity';
import { Family } from './family/entities/family.entity';
import { DiaryTopic } from './diary/entities/diary-topic.entity';
import { Diary } from './diary/entities/diary.entity';
import { User } from './user/entities/user.entity';
import { Roles } from './user/entities/roles.entity';
import { DiaryComment } from './diary/entities/diary-comments.entity';
import { FamilyMoto } from './family/entities/familyMoto.entity';
import { FamilyMotoComment } from './family/entities/familyMotoComments.entity';
import { ChatGroup } from './chats/entities/chat-group.entity';
import { Chat } from './chats/entities/chat.entity';
import { CommunityForum } from './community/entities/community-forum.entity';
import { CommunitySubforum } from './community/entities/community-subforum.entity';
import { CommunityThread } from './community/entities/community-thread.entity';
import { ThreadLike } from './community/entities/thread-like.entity';
import { ThreadComment } from './community/entities/thread-comments.entity';
import { ThreadView } from './community/entities/thread-view.entity';
import { NotificationEntity } from './notification/entities/notification.entity';
import { ChatGroupUser } from './chats/entities/chat-group-user.entity';
import { ChatSetting } from './chats/entities/chat-setting.entity';
import { DiaryUser } from './diary/entities/diary-user.entity';

export const entities = [
    User,
    Diary,
    DiaryUser,
    DiaryTopic,
    Family,
    Settings,
    UserEmotions,
    DiaryLike,
    Roles,
    DiaryComment,
    FamilyMoto,
    FamilyMotoComment,
    ChatGroup,
    Chat,
    ChatGroupUser,
    ChatSetting,
    CommunityForum,
    CommunitySubforum,
    CommunityThread,
    ThreadLike,
    ThreadComment,
    ThreadView,
    NotificationEntity,
]
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatGroup } from "./chat-group.entity";

@Entity()
export class ChatGroupUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'chat_group_id'})
  chatGroupId: number;

  @ManyToOne(() => ChatGroup, chatGroup => chatGroup.chatGroupUsers)
  @JoinColumn({name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column({name: 'user_id'})
  userId: number;

  @ManyToOne(() => User, user => user.chatGroupUsers)
  @JoinColumn({name: 'user_id'})
  user: User;

  @Column({name: 'is_pin', default: false})
  isPin: boolean;

  @Column({name: 'is_mute', default: false})
  isMute: boolean;

}
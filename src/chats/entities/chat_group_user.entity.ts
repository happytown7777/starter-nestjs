import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChatGroup } from "./chat-group.entity";

@Entity()
export class ChatGroupUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'chat_group_id' })
  chatGroupId: number;

  @ManyToOne(() => User, user => user.chatGroupUser)
  @JoinColumn({name: 'user_id'})
  user: User;

  @ManyToOne(() => ChatGroup, chatGroup => chatGroup.chatGroupUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;
}
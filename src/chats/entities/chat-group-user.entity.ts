import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChatGroup } from "./chat-group.entity";

@Entity()
export class ChatGroupUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_group_id' })
  chatGroupId: number;

  @ManyToOne(() => ChatGroup, chatGroup => chatGroup.chatGroupUser, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, user => user.chatGroupUser, { cascade: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
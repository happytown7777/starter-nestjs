import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChatGroup } from "./chat-group.entity";

@Entity()
export class ChatSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type'})
  type: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'related_id' })
  relatedId: number;

  @Column({ name: 'is_group', default: false })
  isGroup: boolean;

}
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Diary } from "./diary.entity";


@Entity()
export class DiaryUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'diary_id' })
  diaryId: number;

  @ManyToOne(() => Diary, diary => diary.diaryUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diary_id' })
  diary: Diary;
  
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, user => user.diaryUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

}
import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { DiaryTopic } from "./diary-topic.entity";

@Entity()
export class Diary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @Column()
    content: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { cascade: true, nullable: false, eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'diary_topic_id' })
    diaryTopicId: number;

    @ManyToOne(() => DiaryTopic, { cascade: true, nullable: false, eager: true })
    @JoinColumn({ name: 'diary_topic_id' })
    diaryTopic: DiaryTopic;
}
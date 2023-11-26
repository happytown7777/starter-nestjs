import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { DiaryTopic } from "./diary-topic.entity";
import { DiaryLike } from "./diary-like.entity";
import { DiaryComment } from "./diary-comments.entity";

@Entity()
export class Diary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @Column({ length: 255 })
    title: string;

    @Column('longtext')
    content: string;

    // @Column({ length: 255 })
    // title: string;

    @Column({ length: 8192, nullable: true })
    imageUrl: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'diary_topic_id' })
    diaryTopicId: number;

    @ManyToOne(() => DiaryTopic, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'diary_topic_id' })
    diaryTopic: DiaryTopic;

    @OneToMany(() => DiaryLike, diaryLike => diaryLike.diary, { cascade: false, nullable: true, eager: true })
    likes: DiaryLike[];

    @OneToMany(() => DiaryComment, diaryComment => diaryComment.diary, { cascade: false, nullable: true, eager: true })
    comments: DiaryComment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
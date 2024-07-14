import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { DiaryTopic } from "./diary-topic.entity";
import { DiaryLike } from "./diary-like.entity";
import { DiaryComment } from "./diary-comments.entity";
import { DiaryUser } from "./diary-user.entity";

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

    @Column({ name: 'is_secret', default: false })
    isSecret: boolean;

    @Column({ name: 'image_url', length: 8192, nullable: true })
    imageUrl: string;

    @Column({ name: 'user_id' })
    userId: number;

    @OneToMany(() => DiaryUser, diaryUser => diaryUser.diary)
    diaryUser: DiaryUser[];

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
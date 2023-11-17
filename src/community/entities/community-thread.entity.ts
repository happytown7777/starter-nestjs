import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { CommunityForum } from "./community-forum.entity";
import { CommunitySubforum } from "./community-subforum.entity";
import { ThreadLike } from "./thread-like.entity";
import { ThreadComment } from "./thread-comments.entity";
import { ThreadView } from "./thread-view.entity";

@Entity()
export class CommunityThread {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({})
    title: string;

    @Column({ length: 5000 })
    content: string;

    @Column({ nullable: true })
    link: string;

    @Column({ nullable: true })
    filename: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'subforum_id' })
    subforumId: number;

    @ManyToOne(() => CommunitySubforum, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subforum_id' })
    subforum: CommunitySubforum;

    @OneToMany(() => ThreadLike, threadLike => threadLike.thread, { cascade: false, nullable: true, eager: true })
    likes: ThreadLike[];

    @OneToMany(() => ThreadComment, threadComment => threadComment.thread, { cascade: false, nullable: true, eager: true })
    comments: ThreadComment[];

    @OneToMany(() => ThreadView, threadView => threadView.thread, { cascade: false, nullable: true, eager: true })
    views: ThreadView[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
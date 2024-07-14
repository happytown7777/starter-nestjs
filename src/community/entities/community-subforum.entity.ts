import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { CommunityForum } from "./community-forum.entity";
import { CommunityThread } from "./community-thread.entity";

@Entity()
export class CommunitySubforum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({})
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ name: 'forum_id' })
    forumId: number;

    @ManyToOne(() => CommunityForum, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'forum_id' })
    forum: CommunityForum;

    @OneToMany(() => CommunityThread, thread => thread.subforum, { cascade: false, nullable: true, eager: false })
    threads: CommunityThread[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
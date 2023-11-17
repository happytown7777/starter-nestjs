import { User } from "src/user/entities/user.entity";
import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CommunityThread } from "./community-thread.entity";

@Entity()
export class ThreadComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 4096 })
    comment: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'thread_id' })
    threadId: number;

    @ManyToOne(() => CommunityThread, { cascade: false, nullable: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thread_id' })
    thread: CommunityThread;

    @Column({ name: 'parent_id', nullable: true, })
    parentId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
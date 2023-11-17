import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { CommunityThread } from "./community-thread.entity";

@Entity()
export class ThreadLike {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'thread_id' })
    threadId: number;

    @ManyToOne(() => CommunityThread, { cascade: false, nullable: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thread_id' })
    thread: CommunityThread;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
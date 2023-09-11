import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Diary } from "./diary.entity";

@Entity()
export class DiaryLike {
    @PrimaryGeneratedColumn()
    id: number;

    
    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'diary_id' })
    diaryId: number;

    @ManyToOne(() => Diary, { cascade: false, nullable: false, eager: false })
    @JoinColumn({ name: 'diary_id' })
    diary: Diary;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
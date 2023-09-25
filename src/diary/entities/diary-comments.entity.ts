import { User } from "src/user/entities/user.entity";
import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Diary } from "./diary.entity";

@Entity()
export class DiaryComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 4096 })
    comment: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { cascade: false, nullable: false, eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'diary_id' })
    diaryId: number;

    @ManyToOne(() => Diary, { cascade: false, nullable: false, eager: false })
    @JoinColumn({ name: 'diary_id' })
    diary: Diary;

    @Column({ name: 'parent_id', nullable: true, })
    parentId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
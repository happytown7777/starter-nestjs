import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CommunitySubforum } from "./community-subforum.entity";

@Entity()
export class CommunityForum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({})
    title: string;

    @OneToMany(() => CommunitySubforum, subforum => subforum.forum, { cascade: false, nullable: true, eager: false })
    subforums: CommunitySubforum[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
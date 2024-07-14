import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 5000 })
    content: string;

    @Column({ name: 'from_id' })
    fromId: number;

    @Column({ name: 'to_id' })
    toId: number;

    @Column({})
    type: string;

    @Column({ nullable: true })
    link: string;

    @Column({ name: 'is_group', default: false })
    isGroup: boolean;

    @Column({ name: 'is_sent', default: false })
    isSent: boolean;

    @Column({ default: false })
    seen: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
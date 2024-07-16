import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    type: string;

    @Column({ length: 1024 })
    url: string;

    @Column({ default: false })
    isRead: boolean;

    @Column('longtext')
    title: string;

    @Column('longtext')
    content: string;

    @Column({ name: 'from_id', nullable: true })
    fromId: number;

    @ManyToOne(() => User, { cascade: true, nullable: true, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'from_id' })
    fromUser: User;

    @Column({ name: 'to_id', nullable: true })
    toId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

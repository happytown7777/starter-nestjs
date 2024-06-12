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
    content: string;

    @Column({ name: 'from_id', nullable: true })
    fromId: number;

    @Column({ name: 'to_id', nullable: true})
    toId: number;

    @ManyToOne(() => User, { cascade: false, nullable: true, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'from_id' })
    fromUser: User;

    @ManyToOne(() => User, { cascade: false, nullable: true, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'to_id' })
    toUser: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

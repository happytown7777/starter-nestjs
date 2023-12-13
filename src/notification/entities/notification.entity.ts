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

    @Column({ name: 'user_id', nullable: true })
    userId: number;

    @ManyToOne(() => User, { cascade: false, nullable: true, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

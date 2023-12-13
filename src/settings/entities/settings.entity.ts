import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    allow_parental_control: boolean;

    @Column({ default: true })
    allow_notification: boolean;

    @Column({ default: true })
    allow_reminder: boolean;

    @Column({ default: true })
    allow_family_notification: boolean;

    @Column({ default: true })
    allow_message_notification: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @OneToOne(() => User, { cascade: false, nullable: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
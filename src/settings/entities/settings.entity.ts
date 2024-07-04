import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @OneToOne(() => User, { cascade: false, nullable: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'allow_everyone_post', default: true })
    allowEveryonePost: boolean;

    @Column({ name: 'allow_reminder', default: true })
    allowReminder: boolean;

    @Column({ name: 'allow_family_notification', default: true })
    allowFamilyNotification: boolean;

    @Column({ name: 'allow_message_notification', default: true })
    allowMessageNotification: boolean;

    @Column({ name: 'diary_pin', default: null })
    diaryPin: string;

    @Column({ name: 'theme_mode', default: true })
    themeMode: boolean;

    @Column({ name: 'default_theme', default: true })
    defaultTheme: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
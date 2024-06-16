import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    allowParentalControl: boolean;

    @Column({ default: true })
    allowEveryonePost: boolean;

    @Column({ default: true })
    allowReminder: boolean;

    @Column({ default: true })
    allowFamilyNotification: boolean;

    @Column({ default: true })
    allowMessageNotification: boolean;

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
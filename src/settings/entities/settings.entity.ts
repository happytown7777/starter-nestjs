import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    allow_parental_control: boolean;

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
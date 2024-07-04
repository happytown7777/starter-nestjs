import { Family } from "src/family/entities/family.entity";
import { Settings } from "src/settings/entities/settings.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roles } from "./roles.entity";
import { ChatGroupUser } from "src/chats/entities/chat_group_user.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column(({ name: 'first_name' }))
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column()
    username: string;

    @Column()
    birthdate: Date;

    @Column({ length: 8192, nullable: true })
    avatar: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ unique: true, nullable: true })
    phone: string;

    @Column({ nullable: true })
    password: string;

    @Column({ name: 'email_verified', default: true })
    emailVerified: boolean;

    @Column({ default: true })
    onboarding: boolean;

    @Column({ default: 0 })
    step: number;

    @Column({ nullable: true, name: 'custom_name' })
    customName: string;

    @Column({ name: 'current_emotion', nullable: true })
    currentEmotion: string;

    @Column({ name: 'family_id', nullable: true })
    familyId?: number | null;

    @ManyToOne(() => Family, { cascade: false, nullable: true, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'family_id' })
    family: Family | null;

    @Column({ name: 'role_id', nullable: true })
    roleId?: number | null;

    @ManyToOne(() => Roles, { cascade: false, nullable: true, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Roles | null;

    @OneToOne(() => Settings, settings => settings.user, { cascade: false, nullable: true, eager: false })
    @JoinColumn()
    settings: Settings | null;

    @Column({ nullable: true, name: 'guardian_id' })
    guardianId: number | null;

    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'guardian_id' })
    gurdian: User | null;

    @OneToMany(() => ChatGroupUser, chatGroupUser => chatGroupUser.user)
    chatGroupUser: ChatGroupUser[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
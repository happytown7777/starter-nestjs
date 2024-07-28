import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, DeleteDateColumn } from "typeorm";

import { ChatGroupUser } from "./chat-group-user.entity";
import { User } from "src/user/entities/user.entity";

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    name: string;

    @Column({ name: 'user_id' })
    userId: number;

    @OneToMany(() => ChatGroupUser, chatGroupUser => chatGroupUser.chatGroup)
    chatGroupUser: ChatGroupUser[];

    // @ManyToMany(() => User)
    // @JoinTable({
    //     name: 'chat_group_user', joinColumn: {
    //         name: 'chat_group_id',
    //         referencedColumnName: 'id',
    //     }, inverseJoinColumn: {
    //         name: 'user_id',
    //         referencedColumnName: 'id',
    //     }
    // })
    // users: User[];

    @Column({ nullable: true })
    image: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}
import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";

import { ChatGroupUser } from "./chat_group_user.entity";

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    name: string;

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
}
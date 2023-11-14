import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    name: string;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'chat_group_user', joinColumn: {
            name: 'chat_group_id',
            referencedColumnName: 'id',
        }, inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        }
    })
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
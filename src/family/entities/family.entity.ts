import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Family {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => User, user => user.family)
    members: User[];
}
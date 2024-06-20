import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Family {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => User, user => user.family, { eager: true })
    members: User[];

    @OneToOne(() => User, user => user.family, { cascade: false, nullable: true, eager: false, onDelete: 'CASCADE' })
    owner: User;

    @Column({ length: 1024, nullable: true })
    imgUrl: string;

    @Column()
    pin: string;

    @Column({ default: 1 })
    structureType: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
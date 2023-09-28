import { User } from "src/user/entities/user.entity";
import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { FamilyMoto } from "./familyMoto.entity";

@Entity()
export class FamilyMotoComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 4096 })
    comment: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { cascade: false, nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'family_moto_id' })
    familyMotoId: number;

    @ManyToOne(() => FamilyMoto, { cascade: false, nullable: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'family_moto_id' })
    familyMoto: FamilyMoto;

    @Column({ name: 'parent_id', nullable: true, })
    parentId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
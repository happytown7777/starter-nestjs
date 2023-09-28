import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Family } from "./family.entity";
import { FamilyMotoComment } from "./familyMotoComments.entity";

@Entity()
export class FamilyMoto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ name: 'family_id' })
    familyId: number;

    @ManyToOne(() => Family, { cascade: false, nullable: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'family_id' })
    family: Family;

    @Column({ default: false })
    archived: boolean;

    @OneToMany(() => FamilyMotoComment, familyMotoComment => familyMotoComment.familyMoto, { cascade: false, nullable: true, eager: true })
    comments: FamilyMotoComment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
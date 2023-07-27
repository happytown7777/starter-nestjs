import { Family } from "src/family/entities/family.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    avatar: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    emailVerified: boolean;

    @Column({ name: 'family_id', nullable: true })
    familyId?: number | null;

    @ManyToOne(() => Family, { cascade: true, nullable: true, eager: true })
    @JoinColumn({ name: 'family_id' })
    family: Family | null;
}
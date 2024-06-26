import { Column, ManyToOne, Entity, PrimaryGeneratedColumn, JoinColumn, Relation } from "typeorm";

@Entity()
export class DiaryTopic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;    
    
    @Column({nullable: true})
    group: string;    
    
    @Column()
    imgUrl: string;
}
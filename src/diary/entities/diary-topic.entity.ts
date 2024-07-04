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
    
    @Column({name: 'image_url', length: 8192, nullable: true })
    imgUrl: string;
}
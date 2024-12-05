import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Classroom } from "../../classroom/entities/classroom.entity";

@Entity()
export class Attach {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  version: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Classroom, (classroom) => classroom.attaches, {
    onDelete: 'CASCADE'
  })
  classroom: Classroom;
}

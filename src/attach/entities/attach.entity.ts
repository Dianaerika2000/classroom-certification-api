import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Classroom } from "../../classroom/entities/classroom.entity";
import { AttachType } from "../enums/attach-type.enum";

@Entity()
export class Attach {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  version: string;

  @Column({
    type: 'enum',
    enum: AttachType,
    default: AttachType.GENERAL,
  })
  type: AttachType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Classroom, (classroom) => classroom.attaches, {
    onDelete: 'CASCADE'
  })
  classroom: Classroom;
}

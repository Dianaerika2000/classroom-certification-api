import { Area } from "src/area/entities/area.entity";
import { Classroom } from "src/classroom/entities/classroom.entity";
import { Form } from "src/form/entities/form.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Assessment } from "./assessment.entity";

@Entity({ name: 'requeriments' })
export class Requeriment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  url: string;

  @ManyToOne(
    () => Assessment,
    assessment => assessment.requeriments,
    { eager: true, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;
}

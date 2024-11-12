import { Assessment } from "src/assessment/entities/assessment.entity";
import { Classroom } from "src/classroom/entities/classroom.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'forms' })
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  server: string;

  @Column({ type: 'timestamp with time zone', name: 'date_completion', default: () => 'CURRENT_TIMESTAMP' })
  completionDate: Date;

  @Column({ type: 'timestamp with time zone', name: 'last_revision_date', default: () => 'CURRENT_TIMESTAMP' })
  lastRevisionDate: Date;

  @Column()
  career: string;

  @Column()
  director: string;

  @Column({ name: 'final_grade', type: 'decimal', precision: 5, scale: 2, default: 0 })
  finalGrade: number;

  @Column({ name: 'responsible_fac' })
  responsible: string;

  @Column({ name: 'content_author' })
  author: string;

  @ManyToOne(
    () => Classroom,
    classroom => classroom.forms,
    { eager: true, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @OneToMany(
    () => Assessment,
    (assessment) => assessment.area,
    { cascade: true, onDelete: 'CASCADE' }
  )
  assessment: Assessment[];
}

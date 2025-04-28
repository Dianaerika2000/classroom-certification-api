import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Attach } from '../../attach/entities/attach.entity';
import { Certification } from '../../certification/entities/certification.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';
import { Form } from '../../form/entities/form.entity';
import { Team } from '../../team/entities/team.entity';
import { Platform } from '../../platform/entities/platform.entity';

@Entity({ name: 'classrooms'})
export class Classroom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ default: 'pendiente' })
  status: string;

  @Column({ name: 'moodle_course_id', nullable: true })
  moodleCourseId: number;

  @CreateDateColumn({ name: 'created_at'})
  createdAt: string;

  @OneToMany(() => Evaluation, evaluation => evaluation.classroom)
  evaluations: Evaluation[];

  @OneToMany(() => Form, (form) => form.classroom, { cascade: true })
  forms: Form[];

  @OneToOne(
    () => Certification, 
    (certification) => certification.classroom, 
    { nullable: true, cascade: ['remove'] }
  )
  certification: Certification | null;

  @OneToMany(() => Attach, (attach) => attach.classroom)
  attaches: Attach[];

  @ManyToOne(() => Team, (team) => team.classrooms)
  team: Team;

  @ManyToOne(() => Platform, (platform) => platform.classrooms, { eager: true })
  platform: Platform;
}
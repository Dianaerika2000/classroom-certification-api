import { Certification } from '../../certification/entities/certification.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';
import { Form } from '../../form/entities/form.entity';
import { Team } from '../../team/entities/team.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @CreateDateColumn({ name: 'created_at'})
  createdAt: string;

  @OneToMany(() => Evaluation, evaluation => evaluation.classroom)
  evaluations: Evaluation[];

  @OneToMany(() => Form, form => form.classroom)
  forms: Form[];

  @OneToMany(() => Certification, certification => certification.classroom)
  certifications: Certification[];

  @ManyToOne(() => Team, (team) => team.classrooms)
  team: Team;
}
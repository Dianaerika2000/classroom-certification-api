import { Evaluation } from 'src/evaluation/entities/evaluation.entity';
import { Form } from 'src/form/entities/form.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Authority } from "../../authority/entities/authority.entity";
import { Classroom } from "../../classroom/entities/classroom.entity";

@Entity({ name: 'certificates' })
export class Certification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'career', type: 'varchar', length: 255 })
  career: string;

  @Column({ name: 'content_author', type: 'varchar', length: 255 })
  contentAuthor: string;

  @Column({ name: 'faculty', type: 'varchar', length: 255 })
  faculty: string;

  @Column({ name: 'evaluator_name', type: 'varchar', length: 255 })
  evaluatorName: string;

  @Column({ name: 'plan', type: 'varchar', length: 255 })
  plan: string;

  @Column({ name: 'modality', type: 'varchar', length: 255 })
  modality: string;

  @Column({ name: 'teacher', type: 'varchar', length: 255 })
  teacher: string;

  @Column({ name: 'teacher_code', type: 'varchar', length: 50 })
  teacherCode: string;

  @Column({ name: 'responsible_fac', nullable: true })
  responsible: string;

  @Column()
  qrUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @OneToOne(() => Classroom, (classroom) => classroom.certification, { nullable: false })
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @ManyToMany(() => Authority, authority => authority.certifications)
  authorities: Authority[];
}

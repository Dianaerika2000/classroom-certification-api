import { Classroom } from "src/classroom/entities/classroom.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @Column({ name: 'team_id', type: 'int' })
  teamId: number;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Classroom, classroom => classroom.certifications, { nullable: false })
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;
}

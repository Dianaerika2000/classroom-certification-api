import { Classroom } from "src/classroom/entities/classroom.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone', name: 'review_date', default: () => 'CURRENT_TIMESTAMP'})
  reviewDate: Date;

  @Column({ type: 'int', default: 0})
  result: number;

  @Column({ type: 'int', name: 'cycle_id' })
  cycleId: number;

  @Column({ type: 'int', name: 'area_id' })
  areaId: number;

  @ManyToOne(
    () => Classroom, 
    classroom => classroom.evaluations, 
    { eager: true, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;
}

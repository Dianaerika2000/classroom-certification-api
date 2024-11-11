import { Area } from "src/area/entities/area.entity";
import { Form } from "src/form/entities/form.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Requeriment } from "./requeriment.entity";

@Entity({ name: 'assessments' })
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ name: 'assessment', type: 'decimal', precision: 5, scale: 2, default: 0 })
  assessment: number;

  @Column({ name: 'conclusions', nullable: true })
  conclusions: string;

  @ManyToOne(
    () => Area,
    area => area.assessment,
    { eager: true, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @ManyToOne(
    () => Form,
    form => form.assessment,
    { eager: true, onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @OneToMany(
    () => Requeriment,
    (requeriments) => requeriments.assessment,
    { cascade: true, onDelete: 'CASCADE' }
  )
  requeriments: Requeriment[];
}

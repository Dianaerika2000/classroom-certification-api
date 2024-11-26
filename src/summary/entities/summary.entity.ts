import { Form } from "../../form/entities/form.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  area: string; 

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  average: number; 

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number; 

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({name: 'weighted_average', type: 'decimal', precision: 5, scale: 2 })
  weightedAverage: number;

  @OneToOne(() => Form, (form) => form.summary)
  @JoinColumn({name: 'form_id'})
  form: Form;
}

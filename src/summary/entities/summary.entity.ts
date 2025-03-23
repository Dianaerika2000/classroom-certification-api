import { Transform } from "class-transformer";
import { Form } from "../../form/entities/form.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  area: string; 

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Transform(({ value }) => Number(value).toFixed(2))
  average: number; 

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Transform(({ value }) => Number(value).toFixed(2))
  percentage: number; 

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Transform(({ value }) => Number(value).toFixed(2))
  weight: number;

  @Column({name: 'weighted_average', type: 'decimal', precision: 5, scale: 2 })
  @Transform(({ value }) => Number(value).toFixed(2))
  weightedAverage: number;

  @ManyToOne(() => Form, (form) => form.summaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;
}

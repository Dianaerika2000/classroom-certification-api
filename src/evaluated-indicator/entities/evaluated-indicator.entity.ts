import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Indicator } from "src/indicator/entities/indicator.entity";
import { Evaluation } from "src/evaluation/entities/evaluation.entity";

@Entity({ name: 'evaluated_indicators'})
export class EvaluatedIndicators {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  result: number;

  @Column()
  observation: string;

  @ManyToOne(
    () => Evaluation,
    (evaluation) => evaluation.evaluated_indicator,
    { eager: true, onDelete: 'CASCADE' }
  )
  evaluation: Evaluation;

  @ManyToOne(
    () => Indicator,
    (indicator) => indicator.evaluated_indicator,
    { eager: true, onDelete: 'CASCADE' }
  )
  indicator: Indicator;
}

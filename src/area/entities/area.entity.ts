import { Assessment } from "src/assessment/entities/assessment.entity";
import { Indicator } from "src/indicator/entities/indicator.entity";
import { Percentage } from "src/percentage/entities/percentage.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'areas' })
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @OneToMany(
    () => Indicator,
    (indicator) => indicator.area,
    { cascade: true, onDelete: 'CASCADE' }
  )
  indicators: Indicator[];

  @OneToMany(
    () => Percentage,
    (percentage) => percentage.area,
    { cascade: true, onDelete: 'CASCADE' }
  )
  cycles_areas: Percentage[];

  @OneToMany(
    () => Assessment,
    (assessment) => assessment.area,
    { cascade: true, onDelete: 'CASCADE' }
  )
  assessment: Assessment[];
}

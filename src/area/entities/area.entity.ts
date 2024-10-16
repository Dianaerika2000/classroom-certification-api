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
    (indicator) => indicator.area
  )
  indicators: Indicator[];

  @OneToMany(
    () => Percentage,
    (percentage) => percentage.area
  )
  cycles_areas: Percentage[];
}

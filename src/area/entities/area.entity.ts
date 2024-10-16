import { Indicator } from "src/indicator/entities/indicator.entity";
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
}

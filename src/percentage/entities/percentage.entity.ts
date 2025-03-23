import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "../../area/entities/area.entity";
import { Cycle } from "../../cycle/entities/cycle.entity";

@Entity({ name: 'cycles_areas'})
export class Percentage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  percentage: number;

  @ManyToOne(
    () => Area,
    (area) => area.cycles_areas,
    { eager: true, onDelete: 'CASCADE' }
  )
  area: Area;

  @ManyToOne(
    () => Cycle,
    (cycle) => cycle.cycles_areas,
    { eager: true, onDelete: 'CASCADE' }
  )
  cycle: Cycle;
}

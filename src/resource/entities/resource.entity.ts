import { Cycle } from "src/cycle/entities/cycle.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'resources' })
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(
    () => Cycle,
    (cycle) => cycle.resources,
    { eager: true }
  )
  cycle: Cycle;
}

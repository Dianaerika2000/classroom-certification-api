import { Indicator } from "src/indicator/entities/indicator.entity";
import { Content } from "../../content/entities/content.entity";
import { Cycle } from "../../cycle/entities/cycle.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

  @OneToMany(
    () => Content,
    (content) => content.resource
  )
  contents: Content[];

  @OneToMany(
    () => Indicator,
    (indicator) => indicator.resource
  )
  indicators: Indicator[];
}

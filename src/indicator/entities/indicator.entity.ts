import { Area } from "src/area/entities/area.entity";
import { Content } from "src/content/entities/content.entity";
import { EvaluatedIndicators } from "src/evaluated-indicator/entities/evaluated-indicator.entity";
import { Resource } from "src/resource/entities/resource.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Indicator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(
    () => Area,
    (area) => area.indicators,
    { eager: true, onDelete: 'CASCADE' }
  )
  area: Area;

  @ManyToOne(
    () => Resource,
    (resource) => resource.indicators,
    { eager: true, onDelete: 'CASCADE' }
  )
  resource: Resource;

  @ManyToOne(
    () => Content,
    (content) => content.indicators,
    { eager: true, onDelete: 'CASCADE' }
  )
  content: Content;

  @OneToMany(
    () => EvaluatedIndicators,
    (evaluated) => evaluated.indicator,
    { cascade: true, onDelete: 'CASCADE' }
  )
  evaluated_indicator: EvaluatedIndicators[];
}

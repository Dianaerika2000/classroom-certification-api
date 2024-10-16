import { Area } from "src/area/entities/area.entity";
import { Content } from "src/content/entities/content.entity";
import { Resource } from "src/resource/entities/resource.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Indicator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(
    () => Area,
    (area) => area.indicators,
    { eager: true }
  )
  area: Area;

  @ManyToOne(
    () => Resource,
    (resource) => resource.indicators,
    { eager: true }
  )
  resource: Resource;

  @ManyToOne(
    () => Content,
    (content) => content.indicators,
    { eager: true }
  )
  content: Content;
}

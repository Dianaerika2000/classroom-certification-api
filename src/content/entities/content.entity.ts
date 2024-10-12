import { Resource } from "src/resource/entities/resource.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'contents' })
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(
    () => Resource,
    (resource) => resource.contents,
    { eager: true }
  )
  resource: Resource;
}

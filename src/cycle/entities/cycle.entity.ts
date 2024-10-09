import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Resource } from '../../resource/entities/resource.entity';

@Entity({ name: 'cycles' })
export class Cycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => Resource,
    (resource) => resource.cycle
  )
  resources: Resource[];
}

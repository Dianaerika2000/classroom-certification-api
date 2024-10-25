import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Resource } from '../../resource/entities/resource.entity';
import { Percentage } from '../../percentage/entities/percentage.entity';

@Entity({ name: 'cycles' })
export class Cycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => Resource,
    (resource) => resource.cycle,
    { cascade: true, onDelete: 'CASCADE' }
  )
  resources: Resource[];

  @OneToMany(
    () => Percentage,
    (percentage) => percentage.cycle,
    { cascade: true, onDelete: 'CASCADE' }
  )
  cycles_areas: Percentage[];
}

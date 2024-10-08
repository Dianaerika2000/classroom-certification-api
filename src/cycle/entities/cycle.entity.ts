import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'cycles' })
export class Cycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

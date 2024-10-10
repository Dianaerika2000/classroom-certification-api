import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'areas' })
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;
}

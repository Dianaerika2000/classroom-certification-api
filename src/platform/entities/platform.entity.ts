import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'platforms'})
export class Platform {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  token: string;
}

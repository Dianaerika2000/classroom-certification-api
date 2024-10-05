import { Team } from "src/team/entities/team.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: String;

  @Column()
  position: String;

  @Column()
  signature: String;

  @ManyToMany(() => Team, (team) => team.personals)
  teams: Team[];
}

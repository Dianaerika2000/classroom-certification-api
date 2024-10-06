import { Personal } from "src/technical-staff/entities/personal";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('varchar')
  management: string;

  @Column('text')
  faculty: string;

  @ManyToMany(() => Personal, (personal) => personal.teams)  
  @JoinTable({
    name: 'team_personals',
  }) 
  personals: Personal[];
}

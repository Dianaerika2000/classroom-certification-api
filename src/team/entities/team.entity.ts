import { Classroom } from "../../classroom/entities/classroom.entity";
import { Personal } from "../../technical-staff/entities/personal";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

  @OneToMany(() => Classroom, (classroom) => classroom.team)
  classrooms: Classroom[];
}

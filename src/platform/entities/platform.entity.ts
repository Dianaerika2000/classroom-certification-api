import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Classroom } from "../../classroom/entities/classroom.entity";

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

  @OneToMany(() => Classroom, (classroom) => classroom.platform)
  classrooms: Classroom[];
}

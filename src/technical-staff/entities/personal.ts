import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Team } from "src/team/entities/team.entity";

@Entity()
export class Personal {
  @ApiProperty({
    example: '1',
    description: 'technical staff ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Juan Perez',
    description: 'technical staff name',
    uniqueItems: false
  })
  @Column()
  name: String;

  @ApiProperty({
    example: 'Editor audivisual y multimedia',
    description: 'technical staff position',
    uniqueItems: false
  })
  @Column()
  position: String;

  @ManyToMany(() => Team, (team) => team.personals)
  teams: Team[];
}

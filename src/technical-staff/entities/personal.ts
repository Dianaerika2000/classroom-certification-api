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

  /* @ApiProperty({
    example: 'http://bucket-name.s3.amazonaws.com/user_signature.png',
    description: 'URL where the technical staff signature is located',
    uniqueItems: true
  })
  @Column()
  signature: String; */

  @ManyToMany(() => Team, (team) => team.personals)
  teams: Team[];
}

import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNumber, IsString, ValidateNested } from "class-validator";

export class CreateTeamDto {
  @ApiProperty({
    example: 'Equipo X',
    description: 'Team name',
    nullable: false
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Gestión  2024',
    description: 'Management to which the team belongs',
    nullable: false
  })
  @IsString()
  management: string;

  @ApiProperty({
    example: 'Facultad de ingeniería en ciencias de la computación y telecomunicaciones',
    description: 'Faculty to which the team belongs',
    nullable: false
  })
  @IsString()
  faculty: string;

  @ApiProperty({
    type: [Number],
    description: 'Array of personal IDs',
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  personal: number[];
}

import { IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFormDto {
  @ApiProperty({
    example: 'FEPCAV007', 
    description: 'The name of the form.',
    type: String,
  })
  @IsString()
  name: string;
  
  @ApiProperty({
    example: 'Virtual', 
    description: 'The server where the virtual classroom is',
    type: String,
  })
  @IsString()
  server: string;

  @ApiProperty({
    example: 'Derecho', 
    description: 'Career to which the virtual classroom belongs',
    type: String,
  })
  @IsString()
  career: string;

  @ApiProperty({
    example: 'Juan Lopez', 
    description: 'Director of the faculty to which the virtual classroom belongs',
    type: String,
  })
  @IsString()
  director: string;

  @ApiProperty({
    example: 'Carlos Pérez', 
    description: 'Responsible for the Facultative DEDTE',
    type: String,
  })
  @IsString()
  responsible: string;

  @ApiProperty({
    example: 'Sarah Pérez', 
    description: 'Content author of classroom',
    type: String,
  })
  @IsString()
  author: string;

  @ApiProperty({
    example: 5.00, 
    description: 'The result of the evaluation, if available',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  finalGrade?: number;

  @ApiProperty({
    example: '1', 
    description: 'The ID of the classroom to which this evaluation belongs.',
    type: Number,
  })
  @IsNumber()
  classroomId: number;
}

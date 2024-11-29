import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsArray } from "class-validator";

export class CreateCertificationDto {
  @ApiProperty({
    description: "Career associated with the certification.",
    example: "Ingeniería en Sistemas",
  })
  @IsString()
  career: string;

  @ApiProperty({
    description: "Author of the content.",
    example: "Juan Perez",
  })
  @IsString()
  contentAuthor: string;

  @ApiProperty({
    description: "Faculty associated with the certification.",
    example: "Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones",
  })
  @IsString()
  faculty: string;
  
  @ApiPropertyOptional({
    description: "Username of the evaluator. Optional if provided through authenticated user.",
    example: "juanita",
  })
  @IsOptional()
  @IsString()
  evaluatorUsername?: string;

  @ApiProperty({
    description: "ID of the classroom to certify.",
    example: 123,
  })
  @IsNumber()
  classroomId: number;

  @ApiProperty({
    description: "Study plan.",
    example: "semestral",
  })
  @IsString()
  plan: string;

  @ApiProperty({
    description: "Course modality.",
    example: "virtual",
  })
  @IsString()
  modality: string;

  @ApiProperty({
    description: "Teacher's name.",
    example: "María González",
  })
  @IsString()
  teacher: string;

  @ApiProperty({
    description: "Teacher's unique code.",
    example: "MG2023",
  })
  @IsString()
  teacherCode: string;

  @ApiPropertyOptional({
    description: "Array of authority IDs to associate with the certification.",
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  authorityIds?: number[];
}

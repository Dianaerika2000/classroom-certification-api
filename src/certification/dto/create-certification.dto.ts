import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

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
  evaluatorUsername: string;

  @ApiProperty({
    description: "ID of the classroom to certify.",
    example: 123,
  })
  @IsNumber()
  classroomId: number;
}

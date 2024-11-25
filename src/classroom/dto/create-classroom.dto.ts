import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ClassroomStatus } from "../enums/classroom-status.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateClassroomDto {
  @ApiProperty({
    description: "Name of the classroom.",
    example: "[2-2024] FINANZAS II - SV",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Unique code for the virtual classroom.",
    example: "[2-2024] FIN450-SV",
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: "Current status of the virtual classroom. Allowed values: 'pendiente', 'en proceso', 'evaluada', 'certificada'.",
    enum: ClassroomStatus,
    example: "pendiente",
  })
  @IsEnum(ClassroomStatus)
  @IsOptional()
  status: ClassroomStatus;

  @ApiProperty({
    description: "ID of the team associated with the classroom.",
    example: 42,
  })
  @IsNumber()
  teamId: number;
}

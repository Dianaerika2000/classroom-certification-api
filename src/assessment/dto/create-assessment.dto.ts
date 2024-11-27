import { IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateAssessmentDto {
  @ApiProperty({
    example: 'El aspecto organizacional de la materia está completo...',
    description: 'The description of the general indicator.',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 23.00,
    description: 'The rating for the general indicator',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  assessment?: number;

  @ApiProperty({
    example: 'Conclusiones al respecto del indicador',
    description: 'The conclusion for the general indicator',
    type: String,
  })
  @IsOptional()
  @IsString()
  conclusions?: string;

  @ApiProperty({
    example: '1',
    description: 'The ID of the area to which this evaluation belongs.',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  areaId?: number;

  @ApiProperty({
    example: 'Diseño Técnico',
    description: 'The name of the area',
    type: String,
  })
  @IsOptional()
  @IsString()
  areaName?: string;

  @ApiProperty({
    example: '1',
    description: 'The ID of the form to which this evaluation belongs.',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  formId: number;
}

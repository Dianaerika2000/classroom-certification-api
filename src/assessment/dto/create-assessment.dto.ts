import { IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
  @IsOptional()
  @IsNumber()
  areaId?: number;

  @ApiProperty({
    example: '1',
    description: 'The ID of the form to which this evaluation belongs.',
    type: Number,
  })
  @IsNumber()
  formId: number;

  @ApiProperty({
    example: 'PA-FPAV',
    description: 'The name of the requeriment.',
    type: String,
  })
  @IsOptional()
  @IsString()
  requerimentName?: string;

  @ApiProperty({
    example: 'https://example-url.com',
    description: 'The url of the requeriment',
    type: String,
  })
  @IsOptional()
  @IsString()
  requerimentUrl?: string;
}

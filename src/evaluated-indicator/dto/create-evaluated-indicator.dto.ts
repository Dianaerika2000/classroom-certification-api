import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEvaluatedIndicatorDto {
  @ApiProperty({
    example: '1', 
    description: 'The result of the indicator.',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  result: number;

  @ApiProperty({
    example: 'El indicador no cumple con lo establecido', 
    description: 'The observations of the evaluated indicator.',
    type: Number,
  })
  @IsString()
  @IsOptional()
  observation: string;

  @IsNotEmpty()
  @IsOptional()
  evaluation: any;

  @IsNotEmpty()
  @IsOptional()
  indicator: any;
}
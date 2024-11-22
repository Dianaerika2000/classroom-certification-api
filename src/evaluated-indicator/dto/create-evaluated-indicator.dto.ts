import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateEvaluatedIndicatorDto {
  @IsNumber()
  @IsNotEmpty()
  result: number;

  @IsString()
  @IsNotEmpty()
  observation: string;

  @IsNotEmpty()
  evaluation: any;

  @IsNotEmpty()
  indicator: any;
}
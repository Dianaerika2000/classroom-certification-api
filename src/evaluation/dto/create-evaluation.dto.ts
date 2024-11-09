import { IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEvaluationDto {
  @ApiProperty({
    example: '1', 
    description: 'The ID of the classroom to which this evaluation belongs.',
    type: Number,
  })
  @IsNumber()
  classroomId: number;
  
  @ApiProperty({
    example: 1, 
    description: 'The ID of the cycle associated with the evaluation',
    type: Number,
  })
  @IsNumber()
  cycleId: number;

  @ApiProperty({
    example: 1, 
    description: 'The ID of the area associated with the evaluation',
    type: Number,
  })
  @IsNumber()
  areaId: number;

  @ApiProperty({
    example: 5, 
    description: 'The result of the evaluation, if available',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  result?: number;
}

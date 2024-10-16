import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreatePercentageDto {
  @ApiProperty({
    example: 30, 
    description: 'The percentage assigned to the area for a specific cycle',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @ApiProperty({
    example: 1, 
    description: 'The ID of the area to which this percentage belongs',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  areaId: number;

  @ApiProperty({
    example: 1, 
    description: 'The ID of the cycle to which this percentage belongs',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  cycleId: number;
}

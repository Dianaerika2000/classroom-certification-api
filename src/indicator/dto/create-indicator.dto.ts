import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateIndicatorDto {
  @ApiProperty({
    example: 'Indicador x', 
    description: 'Indicator name',
    nullable: false
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1, 
    description: 'ID of the area to which this indicator belongs',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  areaId: number;

  @ApiProperty({
    example: 1, 
    description: 'ID of the resource to which this indicator belongs',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  resourceId: number;

  @ApiProperty({
    example: 1, 
    description: 'ID of the content to which this indicator belongs',
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  contentId: number;
}

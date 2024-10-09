import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateResourceDto {
  @ApiProperty({
    example: 'Recurso x', 
    description: 'Resource name',
    nullable: false
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1, 
    description: 'ID of the cycle to which this resource belongs',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  cycleId: number;
}

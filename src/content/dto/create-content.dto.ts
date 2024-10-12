import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateContentDto {
  @ApiProperty({
    example: 'Contenido x', 
    description: 'Content name',
    nullable: false
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1, 
    description: 'ID of the resource to which this content belongs',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  resourceId: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateAreaDto {
  @ApiProperty({
    example: 'Area x', 
    description: 'Area name',
    nullable: false
  })
  @IsString()
  name: string;
}

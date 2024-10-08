import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCycleDto {
  @ApiProperty({
    example: 'Ciclo X',
    description: 'Cycle name',
    nullable: false
  })
  @IsString()
  name: string;
}

import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateTechnicalStaffDto {
  @ApiProperty({
    example: 'Juan Perez',
    description: 'technical staff name',
    nullable: false
  })
  @IsString()
  name: string

  @ApiProperty({
    example: 'Editor audivisual y multimedia',
    description: 'technical staff position',
    nullable: false
  })
  @IsString()
  position: string
}

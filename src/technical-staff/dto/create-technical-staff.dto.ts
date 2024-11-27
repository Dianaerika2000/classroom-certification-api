import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsUrl } from "class-validator"

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

  /* @ApiProperty({
    format: 'binary',
    description: 'File upload for the technical staff signature. Accepts image files.'
  })
  @IsOptional()
  @IsUrl()
  signature: string */
}

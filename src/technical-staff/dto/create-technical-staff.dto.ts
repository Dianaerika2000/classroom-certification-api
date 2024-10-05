import { IsBase64, IsOptional, IsString, IsUrl } from "class-validator"

export class CreateTechnicalStaffDto {
  @IsString()
  name: string

  @IsString()
  position: string

  @IsOptional()
  @IsUrl()
  signature: string
}

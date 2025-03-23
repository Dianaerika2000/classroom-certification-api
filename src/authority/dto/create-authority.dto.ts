import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class CreateAuthorityDto {
  @ApiProperty({ 
    description: 'Name of the authority', 
    example: 'Ing. Sarah Mirna Martínez Cardona' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Position of the authority', 
    example: 'Jefe DEDTE' 
  })
  @IsString()
  position: string;

  @ApiProperty({ 
    description: 'URL of the authority\'s signature', 
    example: 'https://example.com/signature.jpg',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  signature: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreatePlatformDto {
  @ApiProperty({
    description: 'The name of the platform',
    example: 'Moodle UAGRM',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The base URL of the platform',
    example: 'https://virtual.uagrm.edu.bo/conava/dedte',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'The authentication token for the platform',
    example: 'abc12345token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

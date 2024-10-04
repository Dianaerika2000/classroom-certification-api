import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator"

export class LoginDto {
  @ApiProperty({ example: '217288' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'XXXXXXXXXX'})
  @IsString()
  password: string;
}
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  moodleToken: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

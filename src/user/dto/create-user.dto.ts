import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  moodleToken: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

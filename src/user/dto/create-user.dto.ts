import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

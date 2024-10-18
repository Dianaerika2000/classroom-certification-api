import { IsOptional, IsString } from "class-validator";

export class CreateClassroomDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  status: string;
}

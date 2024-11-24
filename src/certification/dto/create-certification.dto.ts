import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCertificationDto {
  @IsString()
  career: string;

  @IsString()
  contentAuthor: string;

  @IsString()
  faculty: string;
  
  @IsOptional()
  @IsString()
  evaluatorUsername: string;

  @IsNumber()
  classroomId: number;

  @IsNumber()
  teamId: number;
}

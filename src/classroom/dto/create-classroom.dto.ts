import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ClassroomStatus } from "../enums/classroom-status.enum";

export class CreateClassroomDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(ClassroomStatus)
  @IsOptional()
  status: ClassroomStatus;

  @IsNumber()
  @IsOptional()
  moodleCourseId: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateAttachDto {
  @ApiProperty({
    description: 'ID of the classroom',
    example: 123,
    type: Number
  })
  @IsNumber()
  classroomId: number;

  @ApiProperty({
    description: 'Moodle course ID',
    example: 456,
    type: Number
  })
  @IsNumber()
  courseId: number;

  @ApiProperty({
    description: 'Moodle token',
    example: 'abc123xyz',
    type: String
  })
  @IsString()
  token: string;
}

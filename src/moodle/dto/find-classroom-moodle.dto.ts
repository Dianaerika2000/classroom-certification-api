import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class FindClassroomMoodleDto {
  @ApiProperty({
    description: 'Authentication token for moodle services',
    example: 'abc123xyz',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Field to search for the classroom. Options: id, fullname, shortname.',
    example: 'shortname',
    type: String,
    enum: ['id', 'fullname', 'shortname'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['id', 'fullname', 'shortname'])
  field: string;

  @ApiProperty({
    description: 'Value used to search for the classroom',
    example: '[1-2021] CTS106-TV',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  value: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class FindClassroomMoodleDto {
  @ApiProperty({
    description: 'Field to search for the classroom. Options: fullname, shortname.',
    example: 'shortname',
    type: String,
    enum: ['fullname', 'shortname'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['fullname', 'shortname'])
  field: string;

  @ApiProperty({
    description: 'Value used to search for the classroom',
    example: '[1-2021] CTS106-TV',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiProperty({
    description: 'ID of the platform where the classroom is searched',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  platformId: number;
}

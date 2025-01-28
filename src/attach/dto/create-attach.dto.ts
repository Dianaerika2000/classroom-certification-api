import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { AttachType } from "../enums/attach-type.enum";

export class CreateAttachDto {
  @ApiProperty({
    description: 'ID of the classroom',
    example: 123,
    type: Number
  })
  @IsNumber()
  classroomId: number;

  @ApiProperty({
    description: 'Type of the attachment',
    example: 'general',
    enum: AttachType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AttachType, { message: `Type must be one of the following: ${Object.values(AttachType).join(', ')}` })
  type?: AttachType;
}

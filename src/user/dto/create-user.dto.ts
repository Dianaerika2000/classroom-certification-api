import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: 'juanperez', 
    description: 'Unique username for the user.',
    nullable: false
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Juan Perez', 
    description: 'Full name of the user.',
    nullable: false
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1, 
    description: 'ID of the user role. This value represents the role assigned to the user, which defines their permissions in the system.',
    nullable: false
  })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

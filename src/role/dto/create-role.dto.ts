import { IsEnum, IsString } from "class-validator";
import { ValidRoles } from "../../common/enums/valid-roles";

export class CreateRoleDto {
  @IsEnum(ValidRoles, {
    message: 'The role must be ADMINISTRATOR or EVALUATOR'
  })
  name: ValidRoles;
}

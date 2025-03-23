import { Controller, Get, } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  // @Auth(ValidRoles.admin)
  @ApiResponse({ status: 200, description: 'List of all roles', type: [Role] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const roles = await this.roleService.findAll();
    return {
      data: {
        message: "Roles obtenidos exitosamente",
        roles: roles,
      }
    };
  }
}

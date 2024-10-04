import { Injectable } from '@nestjs/common';
import { RoleService } from 'src/role/role.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ){}

  async executeSeed(): Promise<void> {
    const roles = [
      { name: 'Administrador' },
      { name: 'Evaluador' },
    ];

    for (const role of roles) {
      const existingRole = await this.roleService.findByName(role.name);
      if (!existingRole) {
        await this.roleService.create(role);
      }
    }

    const adminRole = await this.roleService.findByName('Administrador');
    const adminUser:CreateUserDto = {
      name: this.configService.get('ADMIN_NAME'),
      username: this.configService.get('ADMIN_USERNAME'),
      roleId: adminRole.id  
    }
    await this.userService.create(adminUser);
  }
}

import { Injectable } from '@nestjs/common';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly roleService: RoleService
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
  }
}

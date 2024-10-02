import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
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

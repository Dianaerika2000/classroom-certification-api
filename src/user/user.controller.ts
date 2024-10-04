import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Auth(ValidRoles.admin)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: "Usuario creado exitosamente",
      data: {
        user,
      }
    };
  }

  @Get()
  @Auth(ValidRoles.admin)
  async findAll() {
    const users = await this.userService.findAll();
    return {
      message: "Usuarios obtenidos exitosamente",
      data: {
        users,
      }
    };
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(+id);
    return {
      message: "Usuario obtenido exitosamente",
      data: {
        user,
      }
    };
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(+id, updateUserDto);
    return {
      message: "Usuario actualizado exitosamente",
      data: {
        user: updatedUser,
      }
    };
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(+id);
    return {
      message: "Usuario eliminado exitosamente",
      data: {
        user,
      }
    };
  }

  @Get('moodle/all')
  @Auth(ValidRoles.admin)
  async getAllMoodleUsers(@Query('token') token: string): Promise<any> {
    const users = await this.userService.getAllMoodleUsers(token);
    return {
      message: "Usuarios de Moodle obtenidos exitosamente",
      data: {
        users
      }
    }
  }
}

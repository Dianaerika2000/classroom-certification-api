import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      data: {
        message: "Usuario creado exitosamente",
        user,
      }
    };
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return {
      data: {
        message: "Usuarios obtenidos exitosamente",
        users,
      }
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(+id);
    return {
      data: {
        message: "Usuario obtenido exitosamente",
        user,
      }
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(+id, updateUserDto);
    return {
      data: {
        message: "Usuario actualizado exitosamente",
        user: updatedUser,
      }
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(+id);
    return {
      data: {
        message: "Usuario eliminado exitosamente",
        user,
      }
    };
  }
}

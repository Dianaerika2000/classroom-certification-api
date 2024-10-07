import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'User was created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiResponse({ status: 200, description: 'List of all users', type: [User] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The found user', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The updated user', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The deleted user', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiResponse({ status: 200, description: 'List of all moodle users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

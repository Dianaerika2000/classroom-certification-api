import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassroomService } from './classroom.service';
import { Classroom } from './entities/classroom.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { FindClassroomMoodleDto } from './dto/find-classroom-moodle.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Classroom')
@Controller('classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 201, description: 'Classroom was created successfully', type: Classroom })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createClassroomDto: CreateClassroomDto) {
    const classroom = await this.classroomService.create(createClassroomDto);
    
    return {
      message: "Aula registrada exitosamente",
      data: {
        classroom
      }
    } 
  }

  @ApiQuery({ name: 'status', required: false, description: 'Filter classrooms by status' })
  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of classrooms retrieved successfully', type: [Classroom] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(@Query('status') status?: string) {
    const classrooms = await this.classroomService.findAll(status);
    
    const message = status
      ? `Aulas filtradas por estado ${status} obtenidas exitosamente`
      : "Todas las aulas obtenidas exitosamente";
    
    return {
      message,
      data: {
        classrooms
      }
    }  
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiParam({ name: 'id', type: 'number', description: 'Classroom ID' })
  @ApiResponse({ status: 200, description: 'Classroom retrieved successfully', type: Classroom })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async findOne(@Param('id') id: string) {
    const classroom = await this.classroomService.findOne(+id);
    
    return {
      message: "Aula obtenida exitosamente",
      data: {
        classroom
      }
    }  
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'Classroom ID' })
  @ApiResponse({ status: 200, description: 'Classroom updated successfully', type: Classroom })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async update(@Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
    const classroom = await this.classroomService.update(+id, updateClassroomDto);
    
    return {
      message: "Aula actualizada exitosamente",
      data: {
        classroom
      }
    }  
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'Classroom ID' })
  @ApiResponse({ status: 200, description: 'Classroom deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async remove(@Param('id') id: string) {
    const classroom = await this.classroomService.remove(+id);
    
    return {
      message: "Aula eliminada exitosamente",
      data: {
        classroom
      }
    }  
  }

  @Post('moodle-search')
  @HttpCode(200)
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'Classroom search in Moodle completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Classroom not found in Moodle' })
  async findInMoodle(@Body() findClassroomMoodleDto: FindClassroomMoodleDto) {
    const classrooms = await this.classroomService.findClassroomInMoodle(findClassroomMoodleDto);
    
    return {
      message: "Búsqueda de aulas en Moodle realizada exitosamente",
      data: {
        classrooms
      }
    } 
  }
}

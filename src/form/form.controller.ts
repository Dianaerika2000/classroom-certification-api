import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FormService } from './form.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { CreateFormDto } from './dto/create-form.dto';
import { Form } from './entities/form.entity';
import { UpdateFormDto } from './dto/update-form.dto';

@ApiTags('Form')
@Auth(ValidRoles.admin, ValidRoles.evaluator)
@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Form was created successfully',
    type: Form,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  async create(@Body() createFormDto: CreateFormDto) {
    const form = await this.formService.create(createFormDto);

    return {
      message: 'Formulario creado exitosamente',
      data: {
        form,
      },
    };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Forms retrieved successfully',
    type: [Form],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  async findAll() {
    const forms = await this.formService.findAll();
    return {
      message: 'Formularios obtenidos exitosamente',
      data: {
        forms,
      },
    };
  }

  @Get('classroom/:classroomId')
  @ApiParam({
    name: 'classroomId',
    type: 'number',
    description: 'The ID of the classroom to retrieve form for',
  })
  @ApiResponse({
    status: 200,
    description: 'Forms retrieved successfully',
    type: [Form],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({
    status: 404,
    description: 'The classroom with the provided ID does not exist',
  })
  async findByClassroom(@Param('classroomId') classroomId: number) {
    const forms = await this.formService.findByClassroom(classroomId);

    if (forms.length === 0) {
      return {
        message: `No se encontraron formularios para el aula con ID ${classroomId}`,
        data: {
          forms,
        },
      };
    }

    return {
      message: `Formularios obtenidos exitosamente para el aula con ID ${classroomId}`,
      data: {
        forms,
      },
    };
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the form' })
  @ApiResponse({
    status: 200,
    description: 'Form retrieved successfully',
    type: Form,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid form ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async findOne(@Param('id') id: string) {
    const form = await this.formService.findOne(+id);
    return {
      message: `Form con ID ${id} obtenido exitosamente`,
      data: {
        form,
      },
    };
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'The ID of the form to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Form updated successfully',
    type: Form,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    const updatedForm = await this.formService.update(+id, updateFormDto);
    return {
      message: `Formulario con ID ${id} actualizado exitosamente`,
      data: {
        updatedForm,
      },
    };
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'The ID of the form to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Form deleted successfully',
    type: Form,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async remove(@Param('id') id: string) {
    const form = await this.formService.remove(+id);
    return {
      message: `Formulario con ID ${id} eliminado exitosamente`,
      data: {
        form,
      },
    };
  }

  @Patch(':id/observation')
  @ApiParam({name: 'id', type: 'number', description: 'The ID of the form to update observation'})
  @ApiResponse({status: 200, description: 'Observation updated successfully', type: Form})
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async updateObservation(
    @Param('id') id: number,
    @Body('observation') observation: string,
  ): Promise<{ message: string; data: Form }> {
    const updatedForm = await this.formService.updateObservation(id, observation);
    return {
      message: `Observación del formulario con ID ${id} actualizada exitosamente`,
      data: updatedForm,
    };
  }
}

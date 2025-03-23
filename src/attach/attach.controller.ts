import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttachService } from './attach.service';
import { CreateAttachDto } from './dto/create-attach.dto';
import { Attach } from './entities/attach.entity';
import { AttachType } from './enums/attach-type.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Attachments')
@Controller('attach')
@Auth(ValidRoles.admin, ValidRoles.evaluator)
export class AttachController {
  constructor(private readonly attachService: AttachService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Attachment created successfully', type: Attach })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(@Body() createAttachDto: CreateAttachDto) {
    const attachment = await this.attachService.create(createAttachDto);
    
    return {
      message: "Anexo creado exitosamente",
      data: {
        attachment
      }
    };
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully', type: [Attach] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll() {
    const attachments = await this.attachService.findAll();
    
    return {
      message: "Anexos obtenidos exitosamente",
      data: {
        attachments
      }
    };
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Attachment found successfully', type: Attach })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async findOne(@Param('id') id: number) {
    const attachment = await this.attachService.findOne(id);
    
    return {
      message: "Anexo obtenido exitosamente",
      data: {
        attachment
      }
    };
  }

  @Get('classroom/:classroomId')
  @ApiParam({ 
    name: 'classroomId', 
    type: 'number', 
    description: 'ID of the classroom to retrieve attachments from' 
  })
  @ApiQuery({ 
    name: 'type', 
    enum: AttachType, 
    required: false, 
    description: 'Type of the attachments to filter (general, assign, forum)' 
  })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully', type: [Attach] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async findAllByClassroom(
    @Param('classroomId') classroomId: string,
    //@Query('type') type?: AttachType,
  ) {
    //const attachments = await this.attachService.findAllByClassroom(+classroomId, type || AttachType.GENERAL);
    const attachments = await this.attachService.findAllByClassroom(+classroomId);
    
    return {
      message: "Anexos del aula obtenidos exitosamente",
      data: {
        attachments
      }
    };
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async remove(@Param('id') id: number) {
    const attachment = await this.attachService.remove(id);
    
    return {
      message: "Anexo eliminado exitosamente",
      data: {
        attachment: attachment
      }
    };
  }
}

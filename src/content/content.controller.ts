import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';

import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'Content was created successfully', type: Content })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createContentDto: CreateContentDto) {
    const content = await this.contentService.create(createContentDto);
    
    return {
      message: "Contenido creado exitosamente",
      data: {
        content,
      }
    } 
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all contents', type: [Content] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const contents = await this.contentService.findAll();
    
    return {
      message: "Contenidos obtenidos exitosamente",
      data: {
        contents,
      }
    }
  }

  @Get('resource/:resourceId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all contents for a specific resource', type: [Content] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByCycle(@Param('resourceId', ParseIntPipe) resourceId: number) {
    const contents = await this.contentService.findAllByResource(resourceId);
    
    return {
      message: `Contenidos del recurso con ID ${resourceId} obtenidos exitosamente`,
      data: {
        contents,
      },
    };
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'The found resource', type: Content })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    const content = await this.contentService.findOne(+id);
    
    return {
      message: "Contenido obtenido exitosamente",
      data: {
        content,
      }
    } 
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'The updated content', type: Content })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    const content =  await this.contentService.update(+id, updateContentDto);
    
    return {
      message: "Contenido actualizado exitosamente",
      data: {
        content,
      }
    }
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'The deleted content', type: Content })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async remove(@Param('id') id: string) {
    const content = await this.contentService.remove(+id);
    
    return {
      message: "Contenido eliminado exitosamente",
      data: {
        content,
      }
    } 
  }
}

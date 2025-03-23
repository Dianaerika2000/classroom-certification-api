import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'Resource was created successfully', type: Resource })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createResourceDto: CreateResourceDto) { 
    const resource = await this.resourceService.create(createResourceDto);
    
    return {
      message: "Recurso creado exitosamente",
      data: {
        resource,
      }
    };
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all resources', type: [Resource] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() { 
    const resources = await this.resourceService.findAll();
    
    return {
      message: "Recursos obtenidos exitosamente",
      data: {
        resources,
      }
    };
  }

  @Get('cycle/:cycleId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all resources for a specific cycle', type: [Resource] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByCycle(@Param('cycleId', ParseIntPipe) cycleId: number) {
    const resources = await this.resourceService.findAllByCycle(cycleId);
    
    return {
      message: `Recursos del ciclo ${cycleId} obtenidos exitosamente`,
      data: {
        resources,
      },
    };
  }

  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'The found resource', type: Resource })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) { 
    const resource = await this.resourceService.findOne(+id);

    return {
      message: "Recurso obtenido exitosamente",
      data: {
        resource,
      }
    };
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'The updated user', type: Resource })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) { 
    const updatedResource = await this.resourceService.update(+id, updateResourceDto);
    
    return {
      message: "Recurso actualizado exitosamente",
      data: {
        resource: updatedResource,
      }
    };
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'The deleted resource', type: Resource })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) { 
    const resource = await this.resourceService.remove(+id);
    
    return {
      message: "Recurso eliminado exitosamente",
      data: {
        resource,
      }
    };
  }

  @Get(':id/contents')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiParam({ name: 'id', type: 'number', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'List of contents for a specific resource' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findContents(@Param('id', ParseIntPipe) id: number) {
    const contents = await this.resourceService.findContents(id);

    return {
      message: `Contenidos del recurso ${id} obtenidos exitosamente`,
      data: {
        contents,
      },
    };
  }
}

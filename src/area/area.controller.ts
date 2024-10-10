import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Area } from './entities/area.entity';

@ApiTags('Area')
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'Area was successfully created.', type: Area })
  @ApiResponse({ status: 400, description: 'Bad Request. Check the provided data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Authentication is required.' })
  async create(@Body() createAreaDto: CreateAreaDto) {
    const area = await this.areaService.create(createAreaDto);
    
    return {
      message: "Area creada exitosamente",
      data: {
        area
      }
    };  
  }

  @Get()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 200, description: 'List of all areas.', type: [Area] })
  @ApiResponse({ status: 401, description: 'Unauthorized. Authentication is required.' })
  async findAll() {
    const areas = await this.areaService.findAll();
    
    return {
      message: "Areas obtenidas exitosamente",
      data: {
        areas
      }
    }; 
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Unique ID of the area.' })
  @ApiResponse({ status: 200, description: 'Area found successfully.', type: Area })
  @ApiResponse({ status: 401, description: 'Unauthorized. Authentication is required.' })
  @ApiResponse({ status: 404, description: 'Area not found. Check the provided ID.' })
  async findOne(@Param('id') id: string) {
    const area = await this.areaService.findOne(+id);
    
    return {
      message: "Area obtenida exitosamente",
      data: {
        area
      }
    };
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Unique ID of the area to update.' })
  @ApiResponse({ status: 200, description: 'Area updated successfully.', type: Area })
  @ApiResponse({ status: 400, description: 'Bad Request. Check the provided data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Authentication is required.' })
  @ApiResponse({ status: 404, description: 'Area not found. Check the provided ID.' })
  async update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    const area = await this.areaService.update(+id, updateAreaDto);
    
    return {
      message: "Area actualizada exitosamente",
      data: {
        area
      }
    };
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Unique ID of the area to delete.' })
  @ApiResponse({ status: 200, description: 'Area deleted successfully.', type: Area })
  @ApiResponse({ status: 401, description: 'Unauthorized. Authentication is required.' })
  @ApiResponse({ status: 404, description: 'Area not found. Check the provided ID.' })
  async remove(@Param('id') id: string) {
    const area = await this.areaService.remove(+id);

    return {
      message: "Area eliminada exitosamente",
      data: {
        area
      }
    }; 
  }
}

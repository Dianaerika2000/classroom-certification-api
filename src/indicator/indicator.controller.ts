import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndicatorService } from './indicator.service';
import { Indicator } from './entities/indicator.entity';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Indicator')
@Controller('indicator')
export class IndicatorController {
  constructor(private readonly indicatorService: IndicatorService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'Indicator was created successfully', type: Indicator })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createIndicatorDto: CreateIndicatorDto) {
    const indicator = await this.indicatorService.create(createIndicatorDto);
    
    return {
      message: "Indicador creado exitosamente",
      data: {
        indicator,
      }
    }
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all indicators', type: [Indicator] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const indicators = await this.indicatorService.findAll();
    
    return {
      message: "Indicadores obtenidos exitosamente",
      data: {
        indicators,
      }
    } 
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Indicator ID' })
  @ApiResponse({ status: 200, description: 'The found indicator', type: Indicator })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async findOne(@Param('id') id: string) {
    const indicator = await this.indicatorService.findOne(+id);

    return {
      message: "Indicador obtenido exitosamente",
      data: {
        indicator,
      }
    }
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Indicator ID' })
  @ApiResponse({ status: 200, description: 'The updated indicator', type: Indicator })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async update(@Param('id') id: string, @Body() updateIndicatorDto: UpdateIndicatorDto) {
    const indicator = await this.indicatorService.update(+id, updateIndicatorDto);

    return {
      message: "Indicador actualizado exitosamente",
      data: {
        indicator,
      }
    } 
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Indicator ID' })
  @ApiResponse({ status: 200, description: 'The deleted indicator', type: Indicator })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async remove(@Param('id') id: string) {
    const indicator = await this.indicatorService.remove(+id);
    
    return {
      message: "Indicador eliminado exitosamente",
      data: {
        indicator,
      }
    } 
  }

  @Get('area/:areaId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all indicators for a specific area', type: [Indicator] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByArea(@Param('areaId', ParseIntPipe) areaId: number) {
    const indicators = await this.indicatorService.findAllByArea(areaId);
    
    return {
      message: `Indicadores del area ${areaId} obtenidos exitosamente`,
      data: {
        indicators,
      },
    };
  }

  @Get('area/:areaId/resource/:resourceId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiParam({ name: 'areaId', type: 'number', description: 'Area ID' })
  @ApiParam({ name: 'resourceId', type: 'number', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'List of indicators for a specific area and resource', type: [Indicator] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async findByAreaAndResource(
    @Param('areaId', ParseIntPipe) areaId: number,
    @Param('resourceId', ParseIntPipe) resourceId: number,
  ) {
    const indicators = await this.indicatorService.findByAreaAndResource(areaId, resourceId);

    return {
      message: `Indicadores del area ${areaId} y recurso ${resourceId} obtenidos exitosamente`,
      data: {
        indicators,
      },
    };
  }

  @Get('area/:areaId/content/:contentId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiParam({ name: 'areaId', type: 'number', description: 'Area ID' })
  @ApiParam({ name: 'contentId', type: 'number', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'List of indicators for a specific area and content', type: [Indicator] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Indicator not found' })
  async findByAreaAndContent(
    @Param('areaId', ParseIntPipe) areaId: number,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    const indicators = await this.indicatorService.findByAreaAndContent(areaId, contentId);

    return {
      message: `Indicadores del area ${areaId} y contenido ${contentId} obtenidos exitosamente`,
      data: {
        indicators,
      },
    };
  }
}

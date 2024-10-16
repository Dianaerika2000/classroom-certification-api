import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndicatorService } from './indicator.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { Indicator } from './entities/indicator.entity';

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
  @Auth(ValidRoles.admin)
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
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PercentageService } from './percentage.service';
import { CreatePercentageDto } from './dto/create-percentage.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';
import { Percentage } from './entities/percentage.entity';

@ApiTags('Percentage')
@Controller('percentage')
export class PercentageController {
  constructor(private readonly percentageService: PercentageService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Percentage was created successfully', type: Percentage })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(ValidRoles.admin)
  async create(@Body() createPercentageDto: CreatePercentageDto) {
    const percentage = await this.percentageService.create(createPercentageDto);
    
    return {
      message: "Porcentaje creado exitosamente",
      data: {
        percentage,
      }
    } 
  }

  @Get()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 200, description: 'List of all percentages', type: [Percentage] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const percentages = await this.percentageService.findAll();

    return {
      message: "Porcentajes obtenidos exitosamente",
      data: {
        percentages,
      }
    }  
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Percentage ID' })
  @ApiResponse({ status: 200, description: 'The found percentage', type: Percentage })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Percentage not found' })
  async findOne(@Param('id') id: string) {
    const percentage = await this.percentageService.findOne(+id);

    return {
      message: "Porcentaje obtenido exitosamente",
      data: {
        percentage,
      }
    }
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Percentage ID' })
  @ApiResponse({ status: 200, description: 'The updated percentage', type: Percentage })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Percentage not found' })
  async update(@Param('id') id: string, @Body() updatePercentageDto: UpdatePercentageDto) {
    const percentage = await this.percentageService.update(+id, updatePercentageDto);

    return {
      message: "Porcentaje actualizado exitosamente",
      data: {
        percentage,
      }
    } 
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Percentage ID' })
  @ApiResponse({ status: 200, description: 'The deleted percentage', type: Percentage })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Percentage not found' })
  async remove(@Param('id') id: string) {
    const percentage = await this.percentageService.remove(+id);
    
    return {
      message: "Porcentaje eliminado exitosamente",
      data: {
        percentage,
      }
    }  
  }
}

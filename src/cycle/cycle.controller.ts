import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CycleService } from './cycle.service';
import { Cycle } from './entities/cycle.entity';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Cycle')
@Controller('cycle')
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 201, description: 'Cycle was created successfully', type: Cycle })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createCycleDto: CreateCycleDto) {
    const cycle = await this.cycleService.create(createCycleDto);
    
    return {
      message: "Ciclo creado exitosamente",
      data: {
        cycle
      }
    }; 
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
  @ApiResponse({ status: 200, description: 'List of all cycles', type: [Cycle] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const cycles = await this.cycleService.findAll();
    
    return {
      message: "Ciclos obtenidos exitosamente",
      data: {
        cycles
      }
    }; 
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Cycle ID' })
  @ApiResponse({ status: 200, description: 'The found cycle', type: Cycle })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  async findOne(@Param('id') id: string) {
    const cycle = await this.cycleService.findOne(+id);
    
    return {
      message: "Ciclo obtenido exitosamente",
      data: {
        cycle
      }
    };
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Cycle ID' })
  @ApiResponse({ status: 200, description: 'The updated cycle', type: Cycle })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  async update(@Param('id') id: string, @Body() updateCycleDto: UpdateCycleDto) {
    const cycle = await this.cycleService.update(+id, updateCycleDto);
    
    return {
      message: "Ciclo actualizado exitosamente",
      data: {
        cycle
      }
    };
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiParam({ name: 'id', type: 'number', description: 'Cycle ID' })
  @ApiResponse({ status: 200, description: 'The deleted cycle', type: Cycle })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  async remove(@Param('id') id: string) {
    const cycle = await this.cycleService.remove(+id);
    
    return {
      message: "Ciclo eliminado exitosamente",
      data: {
        cycle
      }
    }; 
  }
}

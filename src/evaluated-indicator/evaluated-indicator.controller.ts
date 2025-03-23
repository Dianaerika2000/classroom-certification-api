import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateEvaluatedIndicatorDto } from './dto/create-evaluated-indicator.dto';
import { EvaluatedIndicators } from './entities/evaluated-indicator.entity';
import { EvaluatedIndicatorsService } from './evaluated-indicator.service';
import { UpdateEvaluatedIndicatorDto } from './dto/update-evaluated-indicator.dto';

@ApiTags('Evaluated Indicator')
@Controller('evaluated-indicator')
export class EvaluatedIndicatorController {
  constructor(private readonly evaluatedIndicatorsService: EvaluatedIndicatorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un indicador evaluado' })
  @ApiBody({ type: CreateEvaluatedIndicatorDto })
  async create(
    @Body() createDto: CreateEvaluatedIndicatorDto,
  ): Promise<EvaluatedIndicators> {
    return await this.evaluatedIndicatorsService.create(createDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Obtener todos los indicadores evaluados' })
  async findAll(): Promise<EvaluatedIndicators[]> {
    return await this.evaluatedIndicatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un indicador evaluado por su ID' })
  @ApiParam({ name: 'id', description: 'ID del indicador evaluado', type: Number })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EvaluatedIndicators> {
    return await this.evaluatedIndicatorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un indicador evaluado' })
  @ApiParam({ name: 'id', description: 'ID del indicador evaluado', type: Number })
  @ApiBody({ type: UpdateEvaluatedIndicatorDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEvaluatedIndicatorDto,
  ): Promise<EvaluatedIndicators> {
    return await this.evaluatedIndicatorsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un indicador evaluado' })
  @ApiParam({ name: 'id', description: 'ID del indicador evaluado', type: Number })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EvaluatedIndicators> {
    return await this.evaluatedIndicatorsService.remove(id);
  }

  @Post('/bulk')
  @ApiOperation({ summary: 'Crear múltiples indicadores evaluados' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        results: { type: 'array', items: { type: 'object' } },
        evaluation: { type: 'number' },
      },
      required: ['results', 'evaluation'],
    },
  })
  async createBulk(
    @Body('results') results: any[],
    @Body('evaluation') evaluation: any,
  ): Promise<EvaluatedIndicators[]> {
    return await this.evaluatedIndicatorsService.createBulk(results, evaluation);
  }

  @Get('/evaluation/:evaluationId')
  @ApiOperation({ summary: 'Obtener indicadores evaluados por evaluación' })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', type: Number })
  async findByEvaluation(
    @Param('evaluationId', ParseIntPipe) evaluationId: number,
  ): Promise<EvaluatedIndicators[]> {
    return await this.evaluatedIndicatorsService.findByEvaluation(evaluationId);
  }
}

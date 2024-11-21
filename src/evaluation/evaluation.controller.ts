import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';

@ApiTags('Evaluation')
@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({ status: 201, description: 'Evaluation was created successfully', type: Evaluation })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  async create(@Body() createEvaluationDto: CreateEvaluationDto) {
    const evaluation = await this.evaluationService.create(createEvaluationDto);

    return {
      message: "Evaluación creada exitosamente",
      data: {
        evaluation
      }
    }
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({ status: 200, description: 'Evaluations retrieved successfully', type: [Evaluation] })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  async findAll() {
    const evaluations = await this.evaluationService.findAll();
    return {
      message: "Evaluaciones obtenidas exitosamente",
      data: {
        evaluations
      }
    };
  }

  @Get('classroom/:classroomId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'classroomId', type: 'number', description: 'The ID of the classroom to retrieve evaluations for' })
  @ApiResponse({ status: 200, description: 'Evaluations retrieved successfully', type: [Evaluation] })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'The classroom with the provided ID does not exist' })
  async findByClassroom(@Param('classroomId') classroomId: number) {
    const evaluations = await this.evaluationService.findByClassroom(classroomId);

    if (evaluations.length === 0) {
      return {
        message: `No se encontraron evaluaciones para el aula con ID ${classroomId}`,
        data: {
          evaluations
        }
      };
    }

    return {
      message: `Evaluaciones obtenidas exitosamente para el aula con ID ${classroomId}`,
      data: {
        evaluations
      }
    };
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the evaluation' })
  @ApiResponse({ status: 200, description: 'Evaluation retrieved successfully', type: Evaluation })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid evaluation ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  async findOne(@Param('id') id: string) {
    const evaluation = await this.evaluationService.findOne(+id);
    return {
      message: `Evaluación con ID ${id} obtenida exitosamente`,
      data: {
        evaluation
      }
    };
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the evaluation to update' })
  @ApiResponse({ status: 200, description: 'Evaluation updated successfully', type: Evaluation })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  async update(@Param('id') id: string, @Body() updateEvaluationDto: UpdateEvaluationDto) {
    const updatedEvaluation = await this.evaluationService.update(+id, updateEvaluationDto);
    return {
      message: `Evaluación con ID ${id} actualizada exitosamente`,
      data: {
        updatedEvaluation
      }
    };
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the evaluation to delete' })
  @ApiResponse({ status: 200, description: 'Evaluation deleted successfully', type: Evaluation })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  async remove(@Param('id') id: string) {
    const evaluation = await this.evaluationService.remove(+id);
    return {
      message: `Evaluación con ID ${id} eliminada exitosamente`,
      data: {
        evaluation
      }
    }
  }

  @Get('fetch-and-match/:moodleCourseId')
  async fetchAndMatchCourseContents(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Query('cycleId', ParseIntPipe) cycleId: number,
    @Query('token') token: string,
  ) {
    const matchedResources = await this.evaluationService.fetchAndMatchCourseContents(moodleCourseId, token, cycleId);

    return {
      message: "Recursos coincidentes obtenidos exitosamente",
      data: matchedResources,
    };
  }

  @ApiOperation({ summary: 'Analyze classroom compliance with defined indicators' })
  @Post('analyze-compliance')
  async analyzeClassroomCompliance(
    @Query('moodleCourseId') moodleCourseId: number,
    @Query('token') token: string,
    @Query('cycleId') cycleId: number,
    @Query('areaId') areaId: number,
  ): Promise<any> {
    return await this.evaluationService.analyzeClassroomCompliance(moodleCourseId, token, cycleId, areaId);
  }

  @Post('evaluate-content')
  async evaluateContentIndicatorsOA(
    @Body('content') content: any,
    @Body('indicators') indicators: any[],
    @Body('matchedContent') matchedContent: any,
    @Query('token') token?: string
  ) {
    try {
      const results = await this.trainingDesignService.evaluateContentIndicators(
        content,
        indicators,
        matchedContent,
        token
      );

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Error evaluando contenido:', error);
      return {
        success: false,
        message: 'Error evaluando contenido',
        error: error.message,
      };
    }
  }

  @Post('evaluate-content-technical')
  async evaluateContentIndicatorsOATech(
    @Body('content') content: any,
    @Body('indicators') indicators: any[],
    @Body('matchedContent') matchedContent: any,
    @Query('token') token?: string
  ) {
    try {
      const results = await this.technicalDesignService.evaluateContentIndicators(
        content,
        indicators,
        matchedContent,
        token
      );

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Error evaluando contenido:', error);
      return {
        success: false,
        message: 'Error evaluando contenido',
        error: error.message,
      };
    }
  }

  @Post('evaluate-content-cycle-ii')
  async evaluateContentIndicatorsCII(
    @Body('content') content: any,
    @Body('indicators') indicators: any[],
    @Body('matchedContent') matchedContent: any,
    @Query('token') token?: string
  ) {
    try {
      const results = await this.trainingDesignCycleService.evaluateContentIndicators(
        content,
        indicators,
        matchedContent,
        token
      );

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Error evaluando contenido:', error);
      return {
        success: false,
        message: 'Error evaluando contenido',
        error: error.message,
      };
    }
  }

  @Post('evaluate-content-cycle-ii-technical')
  async evaluateContentIndicatorsCIITechnical(
    @Body('content') content: any,
    @Body('indicators') indicators: any[],
    @Body('matchedContent') matchedContent: any,
    @Query('token') token?: string,
    @Query('courseid') courseid?: number
  ) {
    try {
      const results = await this.technicalDesignCycleService.evaluateContentIndicators(
        content,
        indicators,
        matchedContent,
        token, 
        courseid
      );

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Error evaluando contenido:', error);
      return {
        success: false,
        message: 'Error evaluando contenido',
        error: error.message,
      };
    }
  }

  @Post('test-evaluate-prior-knowledge')
  async testEvaluatePriorKnowledgeLesson(@Body() body: { indicators: any[]; matchedContent: any }) {
    const { indicators, matchedContent } = body;
    // const result = await this.cycle1Service['evaluatePriorKnowledgeLesson'](indicators, matchedContent);
    const result = await this.cycle1TrainingDesignService['evaluateBibliography'](indicators, matchedContent);
    return {
      indicators,
      matchedContent,
      result,
    };
  }
}

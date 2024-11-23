import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { Repository } from 'typeorm';
import { ClassroomService } from '../classroom/classroom.service';
import { MoodleAnalysisService } from './moodle-analysis/moodle-analysis.service';
import { IndicatorEvaluationService } from './indicator-evaluation/indicator-evaluation.service';
import { EvaluatedIndicatorsService } from 'src/evaluated-indicator/evaluated-indicator.service';
import { ClassroomStatus } from 'src/classroom/enums/classroom-status.enum';
import { AreaService } from 'src/area/area.service';
import { CycleService } from 'src/cycle/cycle.service';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    private readonly classroomService: ClassroomService,
    private readonly moodleAnalysisService: MoodleAnalysisService,
    private readonly indicatorEvaluationService: IndicatorEvaluationService,
    private readonly evaluatedIndicatorService: EvaluatedIndicatorsService,
    private readonly areaService: AreaService,
    private readonly cycleService: CycleService
  ) { }

  async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    const { classroomId, ...evaluationData } = createEvaluationDto;

    const classroom = await this.classroomService.findOne(classroomId);

    const evaluation = this.evaluationRepository.create({
      ...evaluationData,
      result: evaluationData.result ?? 0,
      classroom,
    });

    return await this.evaluationRepository.save(evaluation);
  }

  async findAll(): Promise<Evaluation[]> {
    return await this.evaluationRepository.find();
  }

  async findByClassroom(classroomId: number): Promise<Evaluation[]> {
    const classroom = await this.classroomService.findOne(classroomId);

    if (!classroom) {
      throw new NotFoundException(`Aula con ID ${classroomId} no encontrada`);
    }

    const evaluations = await this.evaluationRepository.find({
      where: { classroom: { id: classroomId } },
      relations: ['classroom'],
    });

    return evaluations;
  }

  async findOne(id: number): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.findOneBy({ id });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID "${id}" not found`);
    }

    return evaluation;
  }

  async update(id: number, updateEvaluationDto: UpdateEvaluationDto): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.preload({
      id: id,
      ...updateEvaluationDto,
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID "${id}" not found`);
    }

    return await this.evaluationRepository.save(evaluation);
  }

  async remove(id: number) {
    const evaluation = await this.findOne(id);

    return await this.evaluationRepository.remove(evaluation);
  }

  async analyzeClassroomCompliance(
    moodleCourseId: number,
    token: string,
    cycleId: number,
    areaId: number,
    evaluationId: number
  ): Promise<any> {
    const evaluation = await this.findOne(evaluationId);
    const classroom = await this.classroomService.findOne(evaluation.classroom.id);

    const { matchedResources, unmatchedResources } =
      await this.moodleAnalysisService.analyzeClassroomContents(
        moodleCourseId,
        token,
        cycleId
      );

    const results = await this.indicatorEvaluationService.evaluateIndicators(
      matchedResources,
      {
        areaId,
        cycleId,
        token,
        courseid: moodleCourseId
      }
    );

    const evaluatedIndicatorsData = results.flatMap(resource =>
      resource.contents.match.flatMap(matchGroup =>
        matchGroup.map(indicator => ({
          indicatorId: indicator.indicatorId,
          results: indicator.result,
          observation: indicator.observation,
        }))
      )
    );

    await this.evaluatedIndicatorService.createBulk(evaluatedIndicatorsData, evaluation)
    const isFullyEvaluated = await this.checkIfClassroomFullyEvaluated(classroom.id);

    if (isFullyEvaluated) {
      await this.classroomService.update(classroom.id, {
        status: ClassroomStatus.EVALUADA
      });
    } else {
      await this.classroomService.update(classroom.id, {
        status: ClassroomStatus.EN_PROCESO
      });
    }

    return {
      message: "Análisis de cumplimiento del aula completado exitosamente",
      data: {
        evaluationId: evaluation.id,
        totalResources: results.length,
        matchedResources: results.length,
        unmatchedResources: unmatchedResources.length,
        evaluatedIndicatorsCount: evaluatedIndicatorsData.length,
        resourceDetails: results.map(resource => ({
          resourceId: resource.resourceId,
          resourceName: resource.resourceName,
          indicatorsMatched: resource.contents.match.length,
          indicatorsResult: resource.contents.match
        })),
        summary: {
          averageComplianceResult: this.calculateTotalResult(evaluatedIndicatorsData)
        }
      }
    };
  }

  async fetchAndMatchCourseContents(moodleCourseId: number, token: string, cycleId: number): Promise<any> {
    return this.moodleAnalysisService.analyzeClassroomContents(
      moodleCourseId,
      token,
      cycleId
    );
  }

  // Helper method in the service
  private calculateTotalResult(evaluatedIndicators: any[]): number {
    if (evaluatedIndicators.length === 0) return 0;

    return evaluatedIndicators.reduce((sum, indicator) => sum + indicator.results, 0);
  }

  private async checkIfClassroomFullyEvaluated(classroomId: number): Promise<boolean> {
    // Obtener todas las evaluaciones para este classroom con sus relaciones
    const evaluations = await this.evaluationRepository.find({
      where: { classroom: { id: classroomId } },
      relations: ['classroom']
    });

    if (evaluations.length === 0) {
      return false;
    }

    // Obtener conjuntos únicos de ciclos y áreas evaluados
    const evaluatedCycles = new Set(evaluations.map(item => item.cycleId));
    const evaluatedAreas = new Set(evaluations.map(item => item.areaId));

    // Obtener la cantidad total de ciclos y áreas que deberían evaluarse
    const requiredCycles = await this.cycleService.findAll();
    const requiredAreas = await this.areaService.findAll();

    // Verificar si se han evaluado todos los ciclos y áreas requeridos
    const allCyclesEvaluated = requiredCycles.every(cycle => evaluatedCycles.has(cycle.id));
    const allAreasEvaluated = requiredAreas.every(area => evaluatedAreas.has(area.id));

    return allCyclesEvaluated && allAreasEvaluated;
  }
}
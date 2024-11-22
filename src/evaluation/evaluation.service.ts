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

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    private readonly classroomService: ClassroomService,
    private readonly moodleAnalysisService: MoodleAnalysisService,
    private readonly indicatorEvaluationService: IndicatorEvaluationService,
    private readonly evaluatedIndicatorService: EvaluatedIndicatorsService
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

    const evaluation = await this.findOne(evaluationId);

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

  // Helper method in the service
  private calculateTotalResult(evaluatedIndicators: any[]): number {
    if (evaluatedIndicators.length === 0) return 0;

    return evaluatedIndicators.reduce((sum, indicator) => sum + indicator.results, 0);
  }

  async fetchAndMatchCourseContents(moodleCourseId: number, token: string, cycleId: number): Promise<any> {
    return this.moodleAnalysisService.analyzeClassroomContents(
      moodleCourseId,
      token,
      cycleId
    );
  }
}
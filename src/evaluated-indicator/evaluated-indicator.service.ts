import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluatedIndicators } from './entities/evaluated-indicator.entity';
import { CreateEvaluatedIndicatorDto } from './dto/create-evaluated-indicator.dto';
import { UpdateEvaluatedIndicatorDto } from './dto/update-evaluated-indicator.dto';

@Injectable()
export class EvaluatedIndicatorsService {
  constructor(
    @InjectRepository(EvaluatedIndicators)
    private evaluatedIndicatorsRepository: Repository<EvaluatedIndicators>,
  ) {}

  async create(createDto: CreateEvaluatedIndicatorDto): Promise<EvaluatedIndicators> {
    const evaluatedIndicator = this.evaluatedIndicatorsRepository.create(createDto);
    return await this.evaluatedIndicatorsRepository.save(evaluatedIndicator);
  }

  async findAll(): Promise<EvaluatedIndicators[]> {
    return await this.evaluatedIndicatorsRepository.find();
  }

  async findOne(id: number): Promise<EvaluatedIndicators> {
    const evaluatedIndicator = await this.evaluatedIndicatorsRepository.findOneBy({ id });
    if (!evaluatedIndicator) {
      throw new NotFoundException(`EvaluatedIndicator with ID "${id}" not found`);
    }
    return evaluatedIndicator;
  }

  async update(id: number, updateDto: UpdateEvaluatedIndicatorDto): Promise<EvaluatedIndicators> {
    const evaluatedIndicator = await this.evaluatedIndicatorsRepository.preload({
      id: id,
      ...updateDto,
    });

    if (!evaluatedIndicator) {
      throw new NotFoundException(`EvaluatedIndicator with ID "${id}" not found`);
    }

    return await this.evaluatedIndicatorsRepository.save(evaluatedIndicator);
  }

  async remove(id: number): Promise<EvaluatedIndicators> {
    const evaluatedIndicator = await this.findOne(id);
    return await this.evaluatedIndicatorsRepository.remove(evaluatedIndicator);
  }

  async createBulk(
    results: any[], 
    evaluation: any
  ): Promise<EvaluatedIndicators[]> {
    const evaluatedIndicators = results.map(result => 
      this.evaluatedIndicatorsRepository.create({
        result: result.results,
        observation: result.observation,
        evaluation: evaluation,
        indicator: result.indicatorId
      })
    );

    return this.evaluatedIndicatorsRepository.save(evaluatedIndicators);
  }

  async findByEvaluation(evaluationId: number): Promise<EvaluatedIndicators[]> {
    return await this.evaluatedIndicatorsRepository.find({
      where: { evaluation: { id: evaluationId } },
      relations: ['indicator', 'evaluation']
    });
  }
}
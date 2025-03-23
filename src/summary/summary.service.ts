import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Summary } from './entities/summary.entity';
import { AreaService } from '../area/area.service';
import { AssessmentService } from '../assessment/assessment.service';
import { FormService } from '../form/form.service';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
    private readonly assessmentService: AssessmentService,
    private readonly areaService: AreaService,
    private readonly formService: FormService,
  ) { }

  async calculateSummary(formId: number): Promise<{
    data: Summary[];
    totalWeight: number;
    totalWeightedAverage: number;
  }> {
    const form = await this.formService.findOne(formId);

    const areas = await this.areaService.findAll();
    const weight = 2.0;
    const summaryData = [];
    let totalWeight = 0;
    let totalWeightedAverage = 0;

    for (const area of areas) {
      const average = await this.assessmentService.getAverageByAreaAndForm(
        area.id,
        formId,
      );

      const percentage = average * 25;
      const weightedAverage = (percentage * weight) / 10;

      totalWeight += weight;
      totalWeightedAverage += weightedAverage;

      const existingSummary = await this.summaryRepository.findOne({
        where: { form: { id: formId }, area: area.name },
      });

      if (existingSummary) {
        existingSummary.average = average;
        existingSummary.percentage = percentage;
        existingSummary.weight = weight;
        existingSummary.weightedAverage = weightedAverage;
        
        const updatedEntry = await this.summaryRepository.save(existingSummary);
        summaryData.push(updatedEntry);
      } else {
        const summaryEntry = this.summaryRepository.create({
          form,
          area: area.name,
          average,
          percentage,
          weight,
          weightedAverage,
        });
        
        const savedEntry = await this.summaryRepository.save(summaryEntry);
        summaryData.push(savedEntry);
      }
    }

    await this.formService.update(form.id, { finalGrade: totalWeightedAverage });
    
    return {
      data: summaryData,
      totalWeight,
      totalWeightedAverage,
    };
  }
}

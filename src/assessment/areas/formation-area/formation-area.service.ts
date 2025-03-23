import { Injectable } from '@nestjs/common';
import { EvaluationService } from '../../../evaluation/evaluation.service';

@Injectable()
export class FormationAreaService {
  constructor(
    private readonly evaluationService: EvaluationService,
  ){}
  
  calculateAverageItem(
    descriptionItem: any,
    areaId: number,
    classroomId: number
  ): number {
    const contentEvaluator = this.getContentEvaluator(descriptionItem);

    if (!contentEvaluator) {
      return 0;
    }

    return contentEvaluator(areaId, classroomId);
  }

  private getContentEvaluator(contentName: string): ((areaId: number, classroomId: number) => number) | null {
    const contentEvaluators = {
      'El aspecto organizacional de la materia está completo (etiqueta, carpeta pedagógica, Foro de avisos, video de presentación, chat)': this.calculateAssessmentCycleOne.bind(this),
      'Contiene todos los elementos de la sección del Ciclo 2 en cada Unidad, alcanzando el 60% del aula virtual construida': this.calculateAssessmentCycleTwo.bind(this),
      'Cumple con todos los indicadores para la construcción de retos del aula virtual': this.calculateAssessmentRetos.bind(this),
      'Contiene todos los elementos del ciclo 3, alcanzando el 25% del aula virtual construida': this.calculateAssessmentCycleThree.bind(this),
      'Cumple con todos los indicadores para la construcción de Foros': this.calculateAssessmentForo.bind(this),
    };

    const evaluator = Object.entries(contentEvaluators).find(([key]) =>
      contentName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }

  private async calculateAssessmentCycleOne(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByArea = await this.evaluationService.fetchEvaluatedIndicatorsByArea(areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByArea.data.evaluatedIndicatorsByArea;

    const filteredIndicators = evaluatedIndicatorsList.filter(
      (indicatorItem: any) =>
        indicatorItem.indicator.resource.cycle.name.toLowerCase() === "aspectos organizacionales" ||
        indicatorItem.indicator.resource.cycle.name.toLowerCase() === "ciclo i"
    );
    const totalIndicators = filteredIndicators.length;
    const totalCorrectIndicators = filteredIndicators.filter((indicator: any) => indicator.result === 1).length;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentCycleTwo(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByArea = await this.evaluationService.fetchEvaluatedIndicatorsByArea(areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByArea.data.evaluatedIndicatorsByArea;

    const filteredIndicators = evaluatedIndicatorsList.filter(
      (indicatorItem: any) => indicatorItem.indicator.resource.cycle.name.toLowerCase() === "ciclo 2"
    );
    const totalIndicators = filteredIndicators.length;
    const totalCorrectIndicators = filteredIndicators.filter((indicator: any) => indicator.result === 1).length;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentCycleThree(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByArea = await this.evaluationService.fetchEvaluatedIndicatorsByArea(areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByArea.data.evaluatedIndicatorsByArea;

    const filteredIndicators = evaluatedIndicatorsList.filter(
      (indicatorItem: any) => indicatorItem.indicator.resource.cycle.name.toLowerCase() === "ciclo 3"
    );
    const totalIndicators = filteredIndicators.length;
    const totalCorrectIndicators = filteredIndicators.filter((indicator: any) => indicator.result === 1).length;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentRetos(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByResource = await this.evaluationService.fetchEvaluatedIndicatorsByResourceName('Retos', areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByResource.data;

    const totalIndicators = evaluatedIndicatorsList.totalIndicators;
    const totalCorrectIndicators = evaluatedIndicatorsList.indicatorsWithValueOne;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentForo(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByResource = await this.evaluationService.fetchEvaluatedIndicatorsByResourceName('Foro de debate', areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByResource.data;

    const totalIndicators = evaluatedIndicatorsList.totalIndicators;
    const totalCorrectIndicators = evaluatedIndicatorsList.indicatorsWithValueOne;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }
}

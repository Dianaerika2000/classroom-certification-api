import { Injectable } from '@nestjs/common';
import { EvaluationService } from 'src/evaluation/evaluation.service';

@Injectable()
export class TechnicalAreaService {
  constructor(
    private readonly evaluationService: EvaluationService,
  ) { }

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
      'Las configuraciones de los componentes del ciclo 1 corresponden al 15% del aula virtual construida': this.calculateAssessmentCycleOne.bind(this),
      'Cumple con las configuraciones general y las restricciones (condicionales) de la secuencia de actividades (ciclo 2)': this.calculateAssessmentCycleTwo.bind(this),
      'Cumple con la configuraciòn de las lecciones, incluyendo preguntas guìas como restricciòn de avance en el contenido': this.calculateAssessmentContentLesson.bind(this),
      'Cumple con las configuraciones generales y especìficas de las actividades del ciclo 3': this.calculateAssessmentCycleThree.bind(this),
      'El banco de preguntas està ordenado por categorías correspondientes a': this.calculateAssessmentEvaluation.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(contentEvaluators).find(([key]) =>
      contentName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }

  private async calculateAssessmentCycleOne(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByArea = await this.evaluationService.fetchEvaluatedIndicatorsByArea(areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByArea.data.evaluatedIndicatorsByArea;

    // Filtrar solo los indicadores de Aspectos Organizacionales y Ciclo 1
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

    // Filtrar solo los indicadores de Aspectos Organizacionales y Ciclo 1
    const filteredIndicators = evaluatedIndicatorsList.filter(
      (indicatorItem: any) => indicatorItem.indicator.resource.cycle.name.toLowerCase() === "ciclo 2"
    );
    const totalIndicators = filteredIndicators.length;
    const totalCorrectIndicators = filteredIndicators.filter((indicator: any) => indicator.result === 1).length;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentContentLesson(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByResource = await this.evaluationService.fetchEvaluatedIndicatorsByResourceName('Lección de contenidos', areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByResource.data;

    const totalIndicators = evaluatedIndicatorsList.totalIndicators;
    const totalCorrectIndicators = evaluatedIndicatorsList.indicatorsWithValueOne;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentCycleThree(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByArea = await this.evaluationService.fetchEvaluatedIndicatorsByArea(areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByArea.data.evaluatedIndicatorsByArea;

    // Filtrar solo los indicadores de Aspectos Organizacionales y Ciclo 1
    const filteredIndicators = evaluatedIndicatorsList.filter(
      (indicatorItem: any) => indicatorItem.indicator.resource.cycle.name.toLowerCase() === "ciclo 3"
    );
    const totalIndicators = filteredIndicators.length;
    const totalCorrectIndicators = filteredIndicators.filter((indicator: any) => indicator.result === 1).length;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentEvaluation(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByResource = await this.evaluationService.fetchEvaluatedIndicatorsByResourceName('Evaluación sumativa', areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByResource.data;

    const totalIndicators = evaluatedIndicatorsList.totalIndicators;
    const totalCorrectIndicators = evaluatedIndicatorsList.indicatorsWithValueOne;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }
}

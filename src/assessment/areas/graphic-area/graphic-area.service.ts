import { Injectable } from '@nestjs/common';
import { EvaluationService } from 'src/evaluation/evaluation.service';

@Injectable()
export class GraphicAreaService {
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
      'La imagen visual del aula (portada y secciòn de inicio) cumple con todos los recursos gráficos correspondientes al ciclo 1': this.calculateAssessmentCycleOne.bind(this),
      'Cumple con todos los recursos gráficos de la sección de unidades temáticas correspondientes al 60% del ciclo 2': this.calculateAssessmentCycleTwo.bind(this),
      'Las lecciones de contenido cumplen con todos los componentes requeridos visualizándose en miniatura': this.calculateAssessmentContentLesson.bind(this),
      'La sección de videoconferencia cumple con todos los indicadores  de revisión': this.calculateAssessmentMapaVideoconferencia.bind(this),
      'Cumple con todoslos recursos gràficos correspondientes al ciclo 3': this.calculateAssessmentMapaCierre.bind(this),
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

  private async calculateAssessmentMapaVideoconferencia(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByResource = await this.evaluationService.fetchEvaluatedIndicatorsByResourceName('Mapa de videoconferencia', areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByResource.data;

    const totalIndicators = evaluatedIndicatorsList.totalIndicators;
    const totalCorrectIndicators = evaluatedIndicatorsList.indicatorsWithValueOne;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }

  private async calculateAssessmentMapaCierre(areaId: number, classroomId: number): Promise<number> {
    const evaluatedIndicatorsByResource = await this.evaluationService.fetchEvaluatedIndicatorsByResourceName('Mapa de cierre', areaId, classroomId);
    const evaluatedIndicatorsList = evaluatedIndicatorsByResource.data;

    const totalIndicators = evaluatedIndicatorsList.totalIndicators;
    const totalCorrectIndicators = evaluatedIndicatorsList.indicatorsWithValueOne;
    const resultAssessment = (5 * totalCorrectIndicators) / totalIndicators;

    return resultAssessment;
  }
}

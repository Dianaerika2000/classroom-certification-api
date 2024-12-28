/* import { Injectable } from '@nestjs/common';

@Injectable()
export class TechnicalAreaService {
  calculateAverageItem(
    descriptionItem: any,
    areaId: number
  ): number {
    const contentEvaluator = this.getContentEvaluator(descriptionItem);

    if (!contentEvaluator) {
      return 0;
    }

    return contentEvaluator(descriptionItem, areaId);
  }

  private getContentEvaluator(contentName: string): ((descriptionItem: any, areaId: any) => number) | null {
    const contentEvaluators = {
      'Las configuraciones de los componentes del ciclo 1 corresponden al 15% del aula virtual construida': this.evaluateMapaInicio.bind(this),
      'Cumple con las configuraciones general y las restricciones (condicionales) de la secuencia de actividades (ciclo 2)': this.evaluatePriorKnowledgeLesson.bind(this),
      'Cumple con la configuraciòn de las lecciones, incluyendo preguntas guìas como restricciòn de avance en el contenido': this.evaluateDiagnosticQuiz.bind(this),
      'Cumple con las configuraciones generales y especìficas de las actividades del ciclo 3': this.evaluateBibliography.bind(this),
      'El banco de preguntas està ordenado por categorías correspondientes a': this.evaluateBibliography.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(contentEvaluators).find(([key]) =>
      contentName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }


}
 */
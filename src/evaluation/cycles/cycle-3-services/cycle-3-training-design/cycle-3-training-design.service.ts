import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';

@Injectable()
export class Cycle3TrainingDesignService {
  evaluateIndicatorsByResource(
    resource: any,
    indicators: any[],
    matchedContent: any,
    token: string
  ): IndicatorResult[] {
    // Determina qué función evaluadora usar según el nombre del contenido
    const contentEvaluator = this.getResourceEvaluator(resource.name);

    if (!contentEvaluator) {
      // Si no hay evaluador para este contenido, marca todos los indicadores para revisión manual
      return indicators.map(indicator => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El indicador "${indicator.name}" requiere verificación manual`
      }));
    }

    // Evalúa los indicadores usando la función específica
    return contentEvaluator(indicators, matchedContent, token);
  }

  /**
    * Retorna la función evaluadora específica según el recurso
    */
  private getResourceEvaluator(resourceName: string): ((indicators: any[], matchedContent: any, token?: string) => IndicatorResult[]) | null {
    const resourceEvaluators = {
      'Mapa de cierre': this.evaluateMapaCierre.bind(this),
      'Evaluación sumativa': this.evaluateSummativeAssessment.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(resourceEvaluators).find(([key]) =>
      resourceName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }

  private async evaluateMapaCierre(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    if (matchedContent) {
      const indicatorHandlers = {
        'mapa de ponderación': async (indicator: any) => {
          return this.evaluateWeightingMap(indicator, matchedContent);
        },
      };

      for (const indicator of indicators) {
        const handlerKey = Object.keys(indicatorHandlers).find(key => indicator.name.includes(key));

        if (handlerKey) {
          const result = await indicatorHandlers[handlerKey](indicator);
          results.push(result);
        } else {
          // Agregar un resultado para revisión manual si no hay handler
          results.push({
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }
    return results; // Devuelve un array de resultados
  }

  /**
   * Evalúa indicadores relacionados con la evaluación sumativa
   */
  private async evaluateSummativeAssessment(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    return this.evaluateUnimplementedContent(indicators, matchedContent, "Evaluación sumativa");
  }

  private evaluateWeightingMap(indicator: any, matchedResources: any): IndicatorResult {
    const hasMapa = matchedResources.summary.toLowerCase().includes('<img src=');

    return {
      indicatorId: indicator.id,
      result: hasMapa ? 1 : 0,
      observation: hasMapa ? 'Cumple con el indicador: mapa de ponderación' : 'No se cumple con el indicador: "Contiene mapa de ponderación"'
    };
  }

  /**
    * Función genérica para evaluar indicadores de contenidos no implementados
    * @param indicators Lista de indicadores a evaluar
    * @param matchedContent Contenido asociado al módulo
    * @param contentName Nombre del contenido específico (e.g., "Curriculum vitae")
    * @returns Array de resultados de indicadores
    */
  private async evaluateUnimplementedContent(indicators: any[], matchedContent: any, contentName: string): Promise<IndicatorResult[]> {
    return indicators.map(indicator => ({
      indicatorId: indicator.id,
      result: 0,
      observation: `El indicador "${indicator.name}" requiere revisión manual.`
    }));
  }
}

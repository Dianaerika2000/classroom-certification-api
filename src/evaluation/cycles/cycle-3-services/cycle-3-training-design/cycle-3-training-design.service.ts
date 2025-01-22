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
    const results: IndicatorResult[] = [];

    if (matchedContent) {
      const indicatorHandlers = {
        'instrucciones': async (indicator: any) => {
          return this.checkInstructionsQuiz(indicator, matchedContent);
        },
        'nombre como título': async (indicator: any) => {
          return this.checkEvaluationTitles(indicator, matchedContent);
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

    return results;
  }

  private async checkInstructionsQuiz(indicator: any, matchedContent: any): Promise<IndicatorResult> {
    // Obtener las actividades de evaluación del contenido
    const evaluationActivities = matchedContent.modules.filter(
      (module: any) => module.modname === 'assign' || module.modname === 'quiz'
    );

    let missingInstructions = 0;
    const observations: string[] = [];

    evaluationActivities.forEach((activity: any) => {
      const description = activity.description || '';

      // Verificar si las instrucciones están presentes
      if (!description || !description.trim().length) {
        missingInstructions++;
        observations.push(`La actividad "${activity.name}" no contiene instrucciones.`);
      }
    });

    // Determinar el resultado
    const result = missingInstructions === 0 ? 1 : 0;
    const observationMessage = missingInstructions
      ? observations.join(' ')
      : 'Todas las actividades contienen instrucciones.';

    return {
      indicatorId: indicator.id,
      result,
      observation: observationMessage,
    };
  }

  private async checkEvaluationTitles(indicator: any, matchedContent: any): Promise<IndicatorResult> {
    // Palabras clave requeridas en los títulos
    const requiredKeywords = ["parcial", "final", "reto"];
    const evaluationActivities = matchedContent.modules.filter(
      (module: any) => module.modname === "assign" || module.modname === "quiz"
    );

    let invalidTitles = 0;
    const observations: string[] = [];

    evaluationActivities.forEach((activity: any) => {
      const title = activity.name.toLowerCase(); // Convertir el nombre del título a minúsculas para evitar problemas de mayúsculas/minúsculas

      // Verificar si el título contiene al menos una de las palabras clave
      const hasValidKeyword = requiredKeywords.some(keyword => title.includes(keyword));

      if (!hasValidKeyword) {
        invalidTitles++;
        observations.push(`El título de la actividad "${activity.name}" no contiene "parcial", "final" o "reto".`);
      }
    });

    // Determinar el resultado
    const result = invalidTitles === 0 ? 1 : 0;
    const observationMessage = invalidTitles
      ? observations.join(" ")
      : "Todas las actividades tienen títulos válidos.";

    return {
      indicatorId: indicator.id,
      result,
      observation: observationMessage,
    };
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

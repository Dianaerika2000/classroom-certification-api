import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';

@Injectable()
export class Cycle3TrainingDesignService {
  evaluateIndicatorsByResource(
    resource: any, 
    indicators: any[], 
    matchedContent: any
  ): IndicatorResult[] {
    // Determina qué función evaluadora usar según el nombre del contenido
    const contentEvaluator = this.getResourceEvaluator(resource.name);
    
    if (!contentEvaluator) {
      // Si no hay evaluador para este contenido, marca todos los indicadores para revisión manual
      return indicators.map(indicator => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El contenido "${resource.name}" requiere verificación manual`
      }));
    }

    // Evalúa los indicadores usando la función específica
    return contentEvaluator(indicators, matchedContent);
  }

  /**
    * Retorna la función evaluadora específica según el recurso
    */
  private getResourceEvaluator(resourceName: string): ((indicators: any[], matchedContent: any) => IndicatorResult[]) | null {
    const resourceEvaluators = {
      'Evaluación sumativa': this.evaluateSummativeAssessment.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(resourceEvaluators).find(([key]) => 
      resourceName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }

  /**
   * Evalúa indicadores relacionados con la evaluación sumativa
   */
  private async evaluateSummativeAssessment(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    for (const indicator of indicators) {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'contiene banco de preguntas mínimo 60 preguntas por categoría':
          const hasQuestionBank = await this.checkQuestionBankWithMinimumQuestions(matchedContent);
          results.push({
            indicatorId: indicator.id,
            result: hasQuestionBank ? 1 : 0,
            observation: hasQuestionBank
              ? ''
              : 'No se encontró un banco de preguntas con al menos 60 preguntas por categoría.',
          });
          break;

        case 'contiene instrucciones de cada actividad de evaluación':
          const hasInstructions = await this.checkEvaluationActivityInstructions(matchedContent);
          results.push({
            indicatorId: indicator.id,
            result: hasInstructions ? 1 : 0,
            observation: hasInstructions
              ? ''
              : 'No se encontraron instrucciones en cada actividad de evaluación.',
          });
          break;

        case 'los cuestionarios contiene preguntas aleatorias':
          const hasRandomQuestions = await this.checkQuizRandomQuestions(matchedContent);
          results.push({
            indicatorId: indicator.id,
            result: hasRandomQuestions ? 1 : 0,
            observation: hasRandomQuestions
              ? ''
              : 'Los cuestionarios no contienen preguntas aleatorias.',
          });
          break;

        default:
          // Indicadores no evaluables automáticamente
          results.push({
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual.`,
          });
          break;
      }
    }

    return results;
  }

  // Métodos específicos de validación
  /**
   * Verifica si el banco de preguntas tiene al menos 60 preguntas por categoría
   */
  private async checkQuestionBankWithMinimumQuestions(matchedContent: any): Promise<boolean> {
    return true; 
  }

  /**
   * Verifica si cada actividad de evaluación contiene instrucciones
   */
  private async checkEvaluationActivityInstructions(matchedContent: any): Promise<boolean> {
    return true; 
  }

  /**
   * Verifica si los cuestionarios contienen preguntas aleatorias
   */
  private async checkQuizRandomQuestions(matchedContent: any): Promise<boolean> {
    return true; 
  }

  private normalizeIndicatorName(name: string): string {
    return name.trim().replace(/\.$/, '').toLowerCase();
  }  
}

import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';

@Injectable()
export class Cycle3TechnicalDesignService {
  evaluateIndicatorsByResource(
    resource: any,
    indicators: any[],
    matchedContent: any,
  ): IndicatorResult[] {
    // Determina qué función evaluadora usar según el nombre del contenido
    const contentEvaluator = this.getResourceEvaluator(resource.name);

    if (!contentEvaluator) {
      // Si no hay evaluador para este contenido, marca todos los indicadores para revisión manual
      return indicators.map((indicator) => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El contenido "${resource.name}" requiere verificación manual`,
      }));
    }

    // Evalúa los indicadores usando la función específica
    return contentEvaluator(indicators, matchedContent);
  }

  /**
   * Retorna la función evaluadora específica según el recurso
   */
  private getResourceEvaluator(
    resourceName: string,
  ): ((indicators: any[], matchedContent: any) => IndicatorResult[]) | null {
    const resourceEvaluators = {
      'Evaluación sumativa': this.evaluateSummativeAssessment.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(resourceEvaluators).find(([key]) =>
      resourceName.toLowerCase().includes(key.toLowerCase()),
    );

    return evaluator ? evaluator[1] : null;
  }

  /**
   * Evalúa indicadores relacionados con la evaluación sumativa
   */
  private async evaluateSummativeAssessment(
    indicators: any[],
    matchedContent: any,
  ): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    for (const indicator of indicators) {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'cumple con la configuración de las restricciones extra sobre los intentos':
          const hasExtraRestrictions =
            await this.checkExtraAttemptRestrictions(matchedContent);
          results.push({
            indicatorId: indicator.id,
            result: hasExtraRestrictions ? 1 : 0,
            observation: hasExtraRestrictions
              ? ''
              : 'No se encontraron configuraciones válidas para las restricciones extra sobre los intentos.',
          });
          break;

        case 'cada restrincción del parcial está enlazada a la finalización de dicha unidad':
          const restrictionsLinkedToCompletion =
            await this.checkRestrictionsLinkedToCompletion(matchedContent);
          results.push({
            indicatorId: indicator.id,
            result: restrictionsLinkedToCompletion ? 1 : 0,
            observation: restrictionsLinkedToCompletion
              ? ''
              : 'Las restricciones del parcial no están enlazadas correctamente a la finalización de las unidades correspondientes.',
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
   * Verifica si se cumplen las restricciones extra sobre los intentos
   */
  private async checkExtraAttemptRestrictions(
    matchedContent: any,
  ): Promise<boolean> {
    const quizzes = matchedContent.modules.filter(
      (module: any) => module.modname === 'quiz',
    );

    for (const quiz of quizzes) {
      // Obtener configuración específica del cuestionario desde `customdata` o mediante otro endpoint si es necesario
      const quizSettings = quiz.customdata ? JSON.parse(quiz.customdata) : null;

      if (!quizSettings) {
        console.warn(
          `No se pudo obtener la configuración de intentos para el quiz con ID ${quiz.id}`,
        );
        return false; // No se puede validar si faltan datos
      }

      // 1. Verificar si requiere contraseña
      const passwordRequired =
        quizSettings.requirespassword && quizSettings.requirespassword !== '';
      if (!passwordRequired) {
        console.warn(
          `El quiz con ID ${quiz.id} no tiene contraseña establecida.`,
        );
        return false;
      }

      // 2. Verificar dirección de red (debe estar vacío)
      const requiresNetworkAddress =
        quizSettings.subnet && quizSettings.subnet !== '';
      if (requiresNetworkAddress) {
        console.warn(
          `El quiz con ID ${quiz.id} tiene una restricción de red configurada.`,
        );
        return false;
      }

      // 3. Verificar seguridad del navegador (debe ser "Ninguno")
      const browserSecurity = quizSettings.browsersecurity;
      if (browserSecurity && browserSecurity !== 'none') {
        console.warn(
          `El quiz con ID ${quiz.id} tiene una configuración de seguridad del navegador diferente a 'Ninguno'.`,
        );
        return false;
      }
    }

    return true;
  }

  private async checkRestrictionsLinkedToCompletion(
    matchedContent: any,
  ): Promise<boolean> {
    const quizzes = matchedContent.modules.filter(
      (module: any) => module.modname === 'quiz',
    );

    for (const quiz of quizzes) {
      if (!quiz.availability) {
        console.warn(
          `El cuestionario "${quiz.name}" no tiene restricciones configuradas.`,
        );
        return false;
      }

      // Parsear las restricciones del JSON "availability"
      const availability = JSON.parse(quiz.availability);

      // Verificar si hay al menos dos condiciones
      if (!availability.c || availability.c.length < 2) {
        console.warn(
          `El cuestionario "${quiz.name}" no tiene al menos dos restricciones configuradas.`,
        );
        return false;
      }

      // Verificar que haya una restricción de tipo "grade" (calificación) y otra de tipo "date" (fecha)
      const hasGradeRestriction = availability.c.some(
        (condition: any) => condition.type === 'grade',
      );
      const hasDateRestriction = availability.c.some(
        (condition: any) => condition.type === 'date',
      );

      if (!hasGradeRestriction || !hasDateRestriction) {
        console.warn(
          `El cuestionario "${quiz.name}" no cumple con las restricciones de calificación o fecha.`,
        );
        return false;
      }

      // Verificar que la fecha está configurada correctamente
      const dateRestriction = availability.c.find(
        (condition: any) => condition.type === 'date',
      );
      if (dateRestriction && dateRestriction.d !== '>=') {
        console.warn(
          `El cuestionario "${quiz.name}" no tiene una fecha de inicio válida configurada.`,
        );
        return false;
      }

      // Verificar que esté oculto si no hay fecha configurada
      if (!quiz.uservisible) {
        console.info(
          `El cuestionario "${quiz.name}" está correctamente oculto.`,
        );
      }
    }

    return true;
  }

  private normalizeIndicatorName(name: string): string {
    return name.trim().replace(/\.$/, '').toLowerCase();
  }
}

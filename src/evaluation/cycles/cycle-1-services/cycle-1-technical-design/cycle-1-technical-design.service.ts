import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';
import { MoodleService } from '../../../../moodle/moodle.service';
import technicalDesignConfig from '../config/technical-design.config.json';

@Injectable()
export class Cycle1TechnicalDesignService {
  constructor(private readonly moodleService: MoodleService) {}

  evaluateIndicatorsByContent(
    content: any,
    indicators: any[],
    matchedContent: any,
    token?: string,
    moodleCourseId?: string,
  ): IndicatorResult[] {
    // Determina qué función evaluadora usar según el nombre del contenido
    const contentEvaluator = this.getContentEvaluator(content.name);

    if (!contentEvaluator) {
      // Si no hay evaluador para este contenido, marca todos los indicadores para revisión manual
      return indicators.map((indicator) => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El contenido "${content.name}" requiere verificación manual`,
      }));
    }

    if (content.name === 'Cuestionario diagnóstico') {
      return contentEvaluator(
        indicators,
        matchedContent,
        token,
        moodleCourseId,
      );
    } else {
      return contentEvaluator(indicators, matchedContent); // Sin pasar token ni moodleCourseId
    }
  }

  /**
   * Retorna la función evaluadora específica según el contenido
   */
  private getContentEvaluator(
    contentName: string,
  ):
    | ((
        indicators: any[],
        matchedContent: any,
        token?: string,
        moodleCourseId?: string,
      ) => IndicatorResult[])
    | null {
    const contentEvaluators = {
      'Mapa de inicio': this.evaluateStartMap.bind(this),
      'Lección de conocimientos previos':
        this.evaluatePriorKnowledgeLesson.bind(this),
      'Cuestionario diagnóstico': this.evaluateDiagnosticQuiz.bind(this),
      Bibliografía: this.evaluateBibliography.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(contentEvaluators).find(([key]) =>
      contentName.toLowerCase().includes(key.toLowerCase()),
    );

    return evaluator ? evaluator[1] : null;
  }

  /**
   * Evalúa indicadores relacionados con el Mapa de inicio
   */
  private async evaluateStartMap(
    indicators: any[],
    matchedContent: any,
  ): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    for (const indicator of indicators) {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'cumple con la configuración de las restricciones de acceso: ver carpeta pedagógica':
          const hasValidAccessRestrictions =
            this.checkAccessRestrictions(matchedContent);
          results.push({
            indicatorId: indicator.id,
            result: hasValidAccessRestrictions ? 1 : 0,
            observation: hasValidAccessRestrictions
              ? ''
              : 'Las restricciones de acceso no cumplen con los criterios: no se encontró la condición "Carpeta pedagógica completada".',
          });
          break;

        default:
          // Indicadores no evaluables automáticamente
          results.push({
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
          break;
      }
    }

    return results; // Devuelve los resultados al final de la ejecución
  }

  /**
   * Evalúa indicadores relacionados con la lección de conocimientos previos
   */
  private async evaluatePriorKnowledgeLesson(
    indicators: any[],
    matchedContent: any,
  ): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    for (const indicator of indicators) {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        // case 'esta lección está añadida en la categoría sin calificación':
        //   const isInNoGradingCategory = this.checkLessonInNoGradingCategory(matchedContent);
        //   results.push({
        //     indicatorId: indicator.id,
        //     result: isInNoGradingCategory ? 1 : 0,
        //     observation: isInNoGradingCategory
        //       ? ''
        //       : 'La lección no está asignada a la categoría "Sin calificación".',
        //   });
        //   break;

        default:
          // Indicadores no evaluables automáticamente
          results.push({
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
          break;
      }
    }

    return results;
  }

  /**
   * Evalúa indicadores relacionados con el cuestionario diagnóstico
   */
  private evaluateDiagnosticQuiz(
    indicators: any[],
    matchedContent: any,
    token?: string,
    moodleCourseId?: number,
  ): IndicatorResult[] {
    return indicators.map((indicator) => {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'cumple con la configuración intentos ilimitados':
          const unlimitedAttemptsConfigured =
            this.checkUnlimitedAttemptsConfiguration(
              matchedContent,
              token,
              moodleCourseId,
            );
          return {
            indicatorId: indicator.id,
            result: unlimitedAttemptsConfigured ? 1 : 0,
            observation: unlimitedAttemptsConfigured
              ? ''
              : 'El cuestionario no está configurado con intentos ilimitados.',
          };

        case 'finalización de la actividad: "recibir calificación de aprobado"':
          const activityCompletionConfigured =
            this.checkActivityCompletionConfiguration(matchedContent);
          return {
            indicatorId: indicator.id,
            result: activityCompletionConfigured ? 1 : 0,
            observation: activityCompletionConfigured
              ? ''
              : 'El cuestionario no cumple con la configuración de finalización: "Recibir calificación de aprobado".',
          };

        default:
          // Indicadores no evaluables automáticamente
          return {
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual.`,
          };
      }
    });
  }

  /**
   * Evalúa indicadores relacionados con la bibliografía
   */
  private evaluateBibliography(
    indicators: any[],
    matchedContent: any,
  ): IndicatorResult[] {
    return indicators.map((indicator) => {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'cumple con la configuración':
          const configurationValid =
            this.checkBibliographyConfiguration(matchedContent);
          return {
            indicatorId: indicator.id,
            result: configurationValid ? 1 : 0,
            observation: configurationValid
              ? ''
              : 'La bibliografía no cumple con la configuración.',
          };

        case 'cumple con la configuración finalización de actividad: "ver"':
          const activityCompletionValid =
            this.checkBibliographyActivityCompletion(matchedContent);
          return {
            indicatorId: indicator.id,
            result: activityCompletionValid ? 1 : 0,
            observation: activityCompletionValid
              ? ''
              : 'La bibliografía no cumple con la configuración de finalización: "Ver".',
          };

        default:
          // Indicadores no evaluables automáticamente
          return {
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual.`,
          };
      }
    });
  }

  // Métodos específicos de validación
  private checkAccessRestrictions(matchedContent: any): boolean {
    return true;
  }

  /**
   * Verifica si el cuestionario está configurado con intentos ilimitados.
   */
  private async checkUnlimitedAttemptsConfiguration(
    matchedContent: any,
    token: string,
    moodleCourseId: number,
  ): Promise<boolean> {
    const quizzes = await this.moodleService.getQuizzesByCourse(
      moodleCourseId,
      token,
    );

    const quiz = quizzes.find((q) => q.id === matchedContent.instance);
    if (!quiz) {
      console.warn(
        `Cuestionario con ID ${matchedContent.instance} no encontrado en el curso ${moodleCourseId}`,
      );
      return false;
    }

    const attempts = quiz.attempts;
    return attempts === 0;
  }

  /**
   * Verifica si la configuración de finalización requiere recibir calificación de aprobado.
   */
  private checkActivityCompletionConfiguration(matchedContent: any): boolean {
    if (
      !matchedContent.completiondata ||
      !Array.isArray(matchedContent.completiondata.details)
    ) {
      console.warn(
        'No se encontró información de finalización en el contenido proporcionado.',
      );
      return false;
    }

    const completionRules = matchedContent.completiondata.details;
    const passGradeRule = completionRules.find(
      (rule) => rule.rulename === 'completionpassgrade',
    );

    if (passGradeRule && passGradeRule.rulevalue?.status === 2) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si la bibliografía cumple con la configuración.
   */
  private checkBibliographyConfiguration(matchedContent: any): boolean {
    try {
      const generalConfig = technicalDesignConfig.resources[0]?.contents.find(
        (content: any) => content.name === 'Bibliografía',
      )?.configuration.general;

      return generalConfig?.name === matchedContent.name;
    } catch (error) {
      console.error(
        'Error al verificar la configuración de la bibliografía:',
        error,
      );
      return false;
    }
  }

  /**
   * Verifica si la configuración de finalización de la actividad es "Ver".
   */
  private checkBibliographyActivityCompletion(matchedContent: any): boolean {
    try {
      // Extraer detalles de completiondata
      const completionDetails = matchedContent?.completiondata?.details;

      // Verificar si existe el detalle con "Ver"
      return (
        Array.isArray(completionDetails) &&
        completionDetails.some(
          (detail: any) =>
            detail.rulename === 'completionview' &&
            detail.rulevalue?.description === 'Ver',
        )
      );
    } catch (error) {
      console.error(
        'Error al verificar la configuración de finalización:',
        error,
      );
      return false;
    }
  }

  private normalizeIndicatorName(name: string): string {
    return name.trim().replace(/\.$/, '').toLowerCase();
  }
}

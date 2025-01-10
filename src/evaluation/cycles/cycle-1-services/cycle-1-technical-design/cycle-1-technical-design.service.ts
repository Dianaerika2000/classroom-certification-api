import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';
import { MoodleService } from '../../../../moodle/moodle.service';
import technicalDesignConfig from '../config/technical-design.config.json';

@Injectable()
export class Cycle1TechnicalDesignService {
  constructor(private readonly moodleService: MoodleService) { }

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
  private getContentEvaluator(contentName: string,): ((indicators: any[], matchedContent: any, token?: string, moodleCourseId?: string) => IndicatorResult[]) | null {
    const contentEvaluators = {
      'Mapa de inicio': this.evaluateStartMap.bind(this),
      'Lección de conocimientos previos': this.evaluatePriorKnowledgeLesson.bind(this),
      'Cuestionario diagnóstico': this.evaluateDiagnosticQuiz.bind(this),
      'Bibliografía': this.evaluateBibliography.bind(this),
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
  private async evaluateStartMap(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    const indicatorHandlers = {
      'general': async (indicator: any) => {
        return this.evaluateGeneralMapaInicio(indicator, matchedContent)
      },
      'acceso': async (indicator: any) => {
        return this.checkAccessRestrictions(indicator, matchedContent);
      }
    };

    for (const indicator of indicators) {
      const handlerKey = Object.keys(indicatorHandlers).find(key => indicator.name.toLowerCase().includes(key));

      if (handlerKey) {
        const result = await indicatorHandlers[handlerKey](indicator);
        results.push(result);
      } else {
        // Agregar un resultado para revisión manual si no hay handler
        results.push({
          indicatorId: indicator.id,
          result: 0,
          observation: 'Este indicador requiere verificación manual',
        });
      }
    }

    return results; // Devuelve los resultados al final de la ejecución
  }

  /**
   * Evalúa indicadores relacionados con la lección de conocimientos previos
   */
  private async evaluatePriorKnowledgeLesson(indicators: any[], matchedContent: any, token: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'finalización de actividad': async (indicator: any) => {
          return this.evaluateCompletionActivity(indicator, matchedContent)
        },
        'respuestas incorrectas': async (indicator: any) => {
          return this.evaluateRedirectionPage(indicator, matchedContent, token)
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
            observation: 'Este indicador requiere verificación manual',
          });
        }
      }
    }

    return results;
  }

  /**
   * Evalúa indicadores relacionados con el cuestionario diagnóstico
   */
  private async evaluateDiagnosticQuiz(indicators: any[], matchedContent: any, token?: string, moodleCourseId?: number): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];
    if (matchedContent != null) {
      const indicatorHandlers = {
        'temporalización y calificación': async (indicator: any) => {
          return this.evaluateTimingQualificationQuizzes(indicator, matchedContent, token, moodleCourseId)
        },
        'Intentos ilimitados': async (indicator: any) => {
          return this.checkUnlimitedAttemptsConfiguration(indicator, matchedContent, token, moodleCourseId)
        },
        'configuración del esquema': async (indicator: any) => {
          return this.evaluateEsquemaQuiz(indicator, matchedContent, token, moodleCourseId)
        },
        'restricciones': async (indicator: any) => {
          return this.evaluateAccessRestrictionsQuizzes(indicator, matchedContent);
        },
        'aprobado': async (indicator: any) => {
          return this.checkActivityCompletionConfiguration(indicator, matchedContent);
        }
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
            observation: 'Este indicador requiere verificación manual',
          });
        }
      }
    }

    return results;
  }

  /**
   * Evalúa indicadores relacionados con la bibliografía
   */
  private async evaluateBibliography(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'cumple con la configuración': async (indicator: any) => {
          return this.checkBibliographyConfiguration(indicator, matchedContent)
        },
        'restricciones de acceso': async (indicator: any) => {
          return this.evaluateAccessRestrictionsQuizzes(indicator, matchedContent);
        },
        'configuración finalización': async (indicator: any) => {
          return this.checkBibliographyActivityCompletion(indicator, matchedContent);
        }
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
            observation: 'Este indicador requiere verificación manual',
          });
        }
      }
    }

    return results;
  }

  /**
   * Funciones auxiliares para evaluar Mapa de inicio
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private evaluateGeneralMapaInicio(indicator: any, matchedContent: any): IndicatorResult {
    const inicioConfig = technicalDesignConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'sección inicio'
    );

    const mapaConfig = inicioConfig.contents.find(item => item.name.toLowerCase() === 'mapa de inicio');

    if (!inicioConfig || !mapaConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Mapa de Inicio" no encontrada en el archivo de configuración.',
      };
    }

    const configName = mapaConfig.configuration.general.sectionName;
    const isValidName = matchedContent.name.toLowerCase().includes(configName.name.toLowerCase());

    return {
      indicatorId: indicator.id,
      result: isValidName ? 1 : 0,
      observation: isValidName ? '' : 'No cumple con la configuración general'
    }
  }

  private checkAccessRestrictions(indicator: any, matchedContent: any): IndicatorResult {
    const hasAccessRestrictions = matchedContent.availabilityinfo?.includes('Carpeta pedagógica');

    return {
      indicatorId: indicator.id,
      result: hasAccessRestrictions ? 1 : 0,
      observation: hasAccessRestrictions
        ? 'La actividad cumple con las restricciones de acceso requeridas, incluyendo "Carpeta pedagógica".'
        : 'La actividad no cumple con las restricciones de acceso requeridas; no se especifica "Carpeta pedagógica" en la configuración.',
    };
  }

  /**
     * Funciones auxiliares para evaluar indicadores de Leccion
     * @param indicator 
     * @param matchedContent 
     * @returns 
     */
  private evaluateCompletionActivity(indicator: any, matchedContent: any): IndicatorResult {
    const allRestrictions = this.hasCompletionData(matchedContent);

    return {
      indicatorId: indicator.id,
      result: allRestrictions ? 1 : 0,
      observation: allRestrictions
        ? 'Cumple con la configuración de finalización de todas las actividades.'
        : `No cumple con la configuración de finalización: ${matchedContent.name}.`,
    };
  }

  private hasCompletionData(module: any): boolean {
    if (!module.completiondata) return false;

    // Verificar si la finalización es automática y si se alcanza el final
    const isAutomatic = module.completiondata.isautomatic;
    const isEndReached = module.completiondata.details?.some(
      detail => detail.rulename === 'completionendreached'
    );

    return isAutomatic && isEndReached;
  }

  private async evaluateRedirectionPage(indicator: any, lesson: any, token: string): Promise<IndicatorResult> {
    try {
      // Verificar redirecciones para cada lección
      const isRedirectionCorrect = await this.isRedirectionCorrect(lesson, token);

      // Crear y devolver el IndicatorResult
      return {
        indicatorId: indicator.id,
        result: isRedirectionCorrect ? 1 : 0,
        observation: isRedirectionCorrect
          ? 'Cumple con la configuración para respuestas incorrectas.'
          : `No cumple con la configuración: ${lesson.name}.`,
      };
    } catch (error) {
      console.error('Error evaluando las páginas de redirección:', error);
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Error al evaluar las configuraciones de redirección.',
      };
    }
  }

  private async isRedirectionCorrect(lesson: any, token: string): Promise<boolean> {
    try {
      // Obtener las páginas de la lección
      const pagesInLesson = await this.moodleService.getLessonPages(lesson.instance, token);

      if (pagesInLesson && Array.isArray(pagesInLesson)) {
        // Filtrar las páginas que son de tipo "Pregunta"
        const questionPages = pagesInLesson.filter(page => page.page.typestring !== 'Contenido');

        // Verificar redirecciones correctas
        const isRedirectCorrect = questionPages.every((page) => {
          const prevpage = page.page.prevpageid;
          return page.jumps.includes(prevpage);
        });

        return isRedirectCorrect;
      }
    } catch (error) {
      console.error(`Error verificando redirecciones para la lección ${lesson.instance}:`, error);
    }

    return false;
  }

  /**
     * Funciones auxiliares para evaluar indicadores de Cuestionario Diagnóstico
     * @param indicator 
     * @param matchedContent 
     * @returns 
     */
  private async evaluateTimingQualificationQuizzes(indicator: any, matchedContent: any, token: string, courseid: number): Promise<IndicatorResult> {
    const initConfig = technicalDesignConfig.resources.find(resource => resource.name.toLowerCase() === 'sección inicio');
    const quizConfig = initConfig.contents.find(item => item.name.toLowerCase() === 'cuestionario diagnóstico');

    // Verificar si la configuración del cuestionario existe
    if (!quizConfig || !initConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Cuestionario Diagnóstico" no encontrada en el archivo de configuración.',
      };
    }

    const config = quizConfig.configuration;
    const isValidResult = await this.checkQuiz(matchedContent, courseid, token, config);

    return {
      indicatorId: indicator.id,
      result: isValidResult ? 1 : 0,
      observation: isValidResult
        ? 'Todos los cuestionarios cumplen con la configuración de temporalización y calificación.'
        : `No cumple con las configuraciones: ${matchedContent.name}.`,
    };
  }

  private async checkQuiz(quiz: any, courseid: number, token: string, config: any): Promise<boolean> {
    try {
      // Verificar si el cuestionario tiene fechas configuradas
      const hasDates = quiz.dates != null;

      // Obtener los datos de los cuestionarios desde Moodle
      const quizzesFromMoodle = await this.moodleService.getQuizzesByCourse(courseid, token);
      const quizData = quizzesFromMoodle?.quizzes?.find((item) => item.coursemodule == quiz.id);

      if (quizData) {
        // Verificar configuración específica del cuestionario
        const isAutosubmit = quizData.overduehandling === config.submission;
        const hasTimeLimit = quizData.timelimit <= 1200 || quizData.timelimit >= 600;

        return isAutosubmit && hasTimeLimit && hasDates;
      }
    } catch (error) {
      console.error(`Error verificando el cuestionario ${quiz.id}:`, error);
    }

    return false;
  }

  private evaluateAccessRestrictionsQuizzes(indicator: any, matchedContent: any): IndicatorResult {
    if (!matchedContent || !matchedContent.availability) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: `No cumple con las restricciones de acceso: ${matchedContent.name}`,
      };
    };

    // Verificar si el texto 'no disponible' está presente en la información de restricciones
    const isValidRestriction = matchedContent.availabilityinfo != null || matchedContent.availability != null;

    return {
      indicatorId: indicator.id,
      result: isValidRestriction ? 1 : 0,
      observation: isValidRestriction
        ? 'Cumple con las restricciones de acceso.'
        : `No cumple con las restricciones de acceso: ${matchedContent.name}`,
    };
  }

  /**
   * Verifica si el cuestionario está configurado con intentos ilimitados.
   */
  private async checkUnlimitedAttemptsConfiguration(
    indicator: any,
    matchedContent: any,
    token: string,
    moodleCourseId: number,
  ): Promise<any> {
    try {
      const quiz = await this.getQuizById(moodleCourseId, token, matchedContent.instance);

      if (!quiz) {
        console.warn(
          `Cuestionario con ID ${matchedContent.instance} no encontrado en el curso ${moodleCourseId}`,
        );
        return {
          indicatorId: indicator.id,
          result: 0,
          observation: `No se encontró el cuestionario con ID ${matchedContent.instance} en el curso ${moodleCourseId}.`,
        };
      }

      // Verificar si el número de intentos es ilimitado (0)
      const isValid = quiz.attempts === 0;

      return {
        indicatorId: indicator.id,
        result: isValid ? 1 : 0,
        observation: isValid
          ? 'El cuestionario está configurado con intentos ilimitados.'
          : 'El cuestionario no está configurado con intentos ilimitados.',
      };
    } catch (error) {
      console.error(
        'Error al verificar la configuración de intentos ilimitados:',
        error,
      );
      return {
        indicatorId: indicator.id,
        result: 0,
        observation:
          'Ocurrió un error al verificar la configuración de intentos ilimitados.',
      };
    }
  }

  /**
   * Verifica si la configuración de finalización requiere recibir calificación de aprobado.
   */
  private checkActivityCompletionConfiguration(indicator: any, matchedContent: any): any {
    try {
      // Validar si existen datos de finalización y son un array
      if (
        !matchedContent.completiondata ||
        !Array.isArray(matchedContent.completiondata.details)
      ) {
        console.warn(
          'No se encontró información de finalización en el contenido proporcionado.',
        );
        return {
          indicatorId: indicator.id,
          result: 0,
          observation: 'No se encontró información de finalización en el contenido proporcionado.',
        };
      }

      const completionRules = matchedContent.completiondata.details;

      // Buscar la regla "completionpassgrade"
      const passGradeRule = completionRules.find(
        (rule) => rule.rulename === 'completionpassgrade',
      );

      const isValid = passGradeRule && passGradeRule.rulevalue?.status === 2;

      return {
        indicatorId: indicator.id,
        result: isValid ? 1 : 0,
        observation: isValid
          ? 'La actividad está configurada para completarse con una calificación aprobatoria.'
          : 'La actividad no está configurada para completarse con una calificación aprobatoria.',
      };
    } catch (error) {
      console.error(
        'Error al verificar la configuración de finalización:',
        error,
      );
      return {
        indicatorId: indicator.id,
        result: 0,
        observation:
          'Ocurrió un error al verificar la configuración de finalización.',
      };
    }
  }

  /**
    * Verifica si el cuestionario tiene la configuración del esquema
    */
  private async evaluateEsquemaQuiz(
    indicator: any,
    matchedContent: any,
    token: string,
    moodleCourseId: number,
  ): Promise<IndicatorResult> {
    try {
      const quiz = await this.getQuizById(
        moodleCourseId,
        token,
        matchedContent.instance,
      );
  
      if (!quiz) {
        console.warn(
          `Cuestionario con ID ${matchedContent.instance} no encontrado en el curso ${moodleCourseId}`,
        );
        return {
          indicatorId: indicator.id,
          result: 0,
          observation: `No se encontró el cuestionario con ID ${matchedContent.instance} en el curso ${moodleCourseId}.`,
        };
      }
  
      // Validar las configuraciones específicas del cuestionario
      const hasDates = quiz.dates != null;
      const isOnePage = quiz.questionsperpage === 0;
      const isNavMethod = quiz.navmethod === 'free';
      const isShuffleAnswers = quiz.shuffleanswers === 1;
      const isPreferredBehaviour = quiz.preferredbehaviour === 'deferredfeedback';
      const isAttemptonLast = quiz.attemptonlast === 0;
  
      const isValid =
        hasDates &&
        isOnePage &&
        isNavMethod &&
        isShuffleAnswers &&
        isPreferredBehaviour &&
        isAttemptonLast;
  
      return {
        indicatorId: indicator.id,
        result: isValid ? 1 : 0,
        observation: isValid
          ? 'El cuestionario cumple con la configuración del esquema, comportamiento de las preguntas y opciones de revisión.'
          : 'El cuestionario no cumple con la configuración requerida.',
      };
    } catch (error) {
      console.error(
        `Error al verificar la configuración del cuestionario ${matchedContent.instance}:`,
        error,
      );
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Ocurrió un error al verificar la configuración del cuestionario.',
      };
    }
  }

  /**
   * Funciones auxiliares para evaluar Bibliografía
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private checkBibliographyActivityCompletion(indicator: any, matchedContent: any): any {
    try {
      // Extraer detalles de completiondata
      const completionDetails = matchedContent?.completiondata?.details;

      // Verificar si existe el detalle con "Ver"
      const isValid =
        Array.isArray(completionDetails) &&
        completionDetails.some(
          (detail: any) =>
            detail.rulename === 'completionview' &&
            detail.rulevalue?.description === 'Ver',
        );

      return {
        indicatorId: indicator.id,
        result: isValid ? 1 : 0, // Resultado 1 si cumple con la regla, 0 de lo contrario.
        observation: isValid
          ? 'La actividad está configurada correctamente para completarse al ser vista.'
          : 'La actividad no tiene configurada la finalización al ser vista.',
      };
    } catch (error) {
      console.error(
        'Error al verificar la configuración de finalización:',
        error,
      );
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Ocurrió un error al verificar la configuración de finalización.',
      };
    }
  }

  private checkBibliographyConfiguration(indicator: any, matchedContent: any): any {
    try {
      const generalConfig = technicalDesignConfig.resources[0]?.contents.find(
        (content: any) => content.name === 'Bibliografía',
      )?.configuration.general;

      const isValid = generalConfig?.name === matchedContent.name;

      return {
        indicatorId: indicator.id,
        result: isValid ? 1 : 0, // Si la configuración es válida, el resultado es 1; de lo contrario, 0.
        observation: isValid ? 'La configuración de la bibliografía es correcta.' : 'La configuración de la bibliografía no coincide.',
      };
    } catch (error) {
      console.error(
        'Error al verificar la configuración de la bibliografía:',
        error,
      );
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Ocurrió un error al verificar la configuración de la bibliografía.',
      };
    }
  }

  /**
   * Obtiene un cuestionario específico de un curso en Moodle.
   *
   * @param moodleCourseId - ID del curso en Moodle.
   * @param token - Token de autenticación para la API de Moodle.
   * @param quizId - ID del cuestionario que se desea obtener.
   * @returns Una promesa que resuelve al cuestionario encontrado o `null` si no se encuentra.
   */
  private async getQuizById(moodleCourseId: number, token: string, quizId: number): Promise<any | null> {
    try {
      const quizzes = await this.moodleService.getQuizzesByCourse(moodleCourseId, token);
      
      const quiz = quizzes.quizzes.find((q) => q.id === quizId);

      return quiz || null;
    } catch (error) {
      console.error(
        `Error al obtener el cuestionario con ID ${quizId} en el curso ${moodleCourseId}:`,
        error,
      );
      throw error;
    }
  }
}

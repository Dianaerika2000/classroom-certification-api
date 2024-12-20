import { Injectable } from '@nestjs/common';
import technicalConfig from '../technical-design-cycle-ii/config/technical-design-config.json';
import { JSDOM } from 'jsdom';
import { MoodleService } from 'src/moodle/moodle.service';
import { IndicatorResult } from 'src/evaluation/interfaces/indicator-result.interface';

@Injectable()
export class TechnicalDesignCycleIiService {
  constructor(
    private readonly moodleService: MoodleService,
  ) { }

  /**
  * Evalúa los indicadores para un recurso específico de Aspectos Organizacionales
  */
  evaluateContentIndicators(
    content: any,
    indicators: any[],
    matchedContent: any,
    token?: string,
    courseid?: number
  ): IndicatorResult[] {
    // Determina qué función evaluadora usar según el recurso
    const contentEvaluator = this.getContentEvaluator(content.name);

    if (!contentEvaluator) {
      // Si no hay evaluador para este recurso, marca todos los indicadores para revisión manual
      return indicators.map(indicator => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El indicador "${indicator.name}" requiere verificación manual`
      }));
    }

    // Evalúa los indicadores usando el evaluador específico
    return contentEvaluator(indicators, matchedContent, token, courseid);
  }

  /**
 * Retorna la función evaluadora específica según el recurso
 */
  private getContentEvaluator(contentName: string): ((indicators: any[], matchedContent: any, token?: string, courseid?: number) => IndicatorResult[]) | null {
    const resourceEvaluators = {
      'Mapa mental': this.evaluateMapaMental.bind(this),
      'Lección de contenidos': this.evaluateLeccionContenidos.bind(this),
      'Cuestionario de autoevaluación': this.evaluateCuestionarios.bind(this),
      'Retos': this.evaluateRetos.bind(this),
      'Foro de debate': this.evaluateForos.bind(this),
      'Mapa de videoconferencia': this.evaluateMapaVideoconferencias.bind(this),
      'Sección de Videoconferencia': this.evaluateVideoconferencias.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(resourceEvaluators).find(([key]) =>
      contentName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }

  /**
   * Función para evaluar los indicadores técnicos de: Mapa Mental
   * @param indicators 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateMapaMental(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'general': async (indicator: any) => {
          return this.evaluateGeneralMapaMental(indicator, matchedContent)
        },
        'acceso': async (indicator: any) => {
          return this.evaluateAccessRestrictions(indicator, matchedContent);
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  /**
   * Función para evaluar los indicadores técnicos de: Lecciones de contenido
   * @param indicators 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateLeccionContenidos(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  /**
   * Función para evaluar los indicadores de Cuestionarios
   * @param indicators 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateCuestionarios(indicators: any[], matchedContent: any, token: string, courseid: number): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'temporalización y calificación': async (indicator: any) => {
          return this.evaluateTimingQualificationQuizzes(indicator, matchedContent, token, courseid)
        },
        'configuración del esquema': async (indicator: any) => {
          return this.evaluateEsquemaQuiz(indicator, matchedContent, token, courseid)
        },
        'restricciones': async (indicator: any) => {
          return this.evaluateAccessRestrictionsQuizzes(indicator, matchedContent);
        },
        'finalización': async (indicator: any) => {
          return this.evaluateCompletionActivityQuizzes(indicator, matchedContent, token, courseid);
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  /**
   * Función para evaluar los indicadores de Cuestionarios
   * @param indicators 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateRetos(indicators: any[], matchedContent: any, token: string, courseid: number): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'general': async (indicator: any) => {
          return this.evaluateGeneralRetos(indicator, matchedContent)
        },
        'disponibilidad': async (indicator: any) => {
          return this.evaluateAvailabilityRetos(indicator, matchedContent);
        },
        'entrega': async (indicator: any) => {
          return this.evaluateSubmissionRetos(indicator, matchedContent);
        },
        'calificación': async (indicator: any) => {
          return this.evaluateGradingRetos(indicator, matchedContent);
        },
        'finalización': async (indicator: any) => {
          return this.evaluateCompletionDataRetos(indicator, matchedContent, courseid, token);
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  /**
   * Función para evaluar los indicadores de Cuestionarios
   * @param indicators 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateForos(indicators: any[], matchedContent: any, token: string, courseid: number): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'general': async (indicator: any) => {
          return this.evaluateGeneralForos(indicator, matchedContent)
        },
        'adjuntos': async (indicator: any) => {
          return this.evaluateAttachmentForos(indicator, matchedContent);
        },
        'abierto': async (indicator: any) => {
          return this.evaluateFreeForos(indicator, matchedContent);
        },
        'acceso': async (indicator: any) => {
          return this.evaluateAccessForos(indicator, matchedContent, courseid, token);
        },
        'finalización': async (indicator: any) => {
          return this.evaluateCompletionConfigForo(indicator, matchedContent);
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  /**
   * Función para evaluar los indicadores de Videoconferencias
   * @param indicators 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateMapaVideoconferencias(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'cumple la configuración general': async (indicator: any) => {
          return this.evaluateGeneralSectionVideo(indicator, matchedContent)
        },
        'cumple con la finalización': async (indicator: any) => {
          return this.evaluateCompletionUrls(indicator, matchedContent)
        },
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  private async evaluateVideoconferencias(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'configuración general': async (indicator: any) => {
          return this.evaluateGeneralBookVideo(indicator, matchedContent)
        },
        'páginas': async (indicator: any) => {
          return this.hasPageForeachUnit(indicator, matchedContent);
        },
        'restricciones': async (indicator: any) => {
          return this.evaluateRestrictionsBookVideo(indicator, matchedContent);
        },
        'contiene la finalización': async (indicator: any) => {
          return this.evaluateCompletionBookVideo(indicator, matchedContent)
        },
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
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
        }
      }
    }

    return results; // Devuelve un array de resultados
  }

  /**
   * Funciones auxiliares para evaluar indicadores de Mapa Mental: 
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private evaluateGeneralMapaMental(indicator: any, matchedContent: any): IndicatorResult {
    const mapaMentalConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'mapa mental'
    );

    if (!mapaMentalConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Mapa Mental" no encontrada en el archivo de configuración.',
      };
    }

    const config = mapaMentalConfig.general;
    const lessonSections = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Detallar las secciones que no cumplen
    const sectionValidations = lessonSections.map(section => ({
      section,
      validObjective: this.isValidUnitObjective(section),
      validName: this.isValidUnitName(section, config.name)
    }));

    const invalidSections = sectionValidations.filter(
      validation => !validation.validObjective || !validation.validName
    );

    const allValidObjectives = sectionValidations.every(validation => validation.validObjective);
    const allValidNames = sectionValidations.every(validation => validation.validName);

    // Construir observación detallada
    let observation = '';
    if (!allValidObjectives || !allValidNames) {
      observation = 'Secciones inválidas:\n';
      invalidSections.forEach(invalidSection => {
        const sectionName = invalidSection.section.name;
        if (!invalidSection.validObjective && !invalidSection.validName) {
          observation += `- ${sectionName}: Sin objetivo válido y nombre incorrecto\n`;
        } else if (!invalidSection.validObjective) {
          observation += `- ${sectionName}: Sin objetivo válido\n`;
        } else if (!invalidSection.validName) {
          observation += `- ${sectionName}: Nombre incorrecto\n`;
        }
      });
    }

    return {
      indicatorId: indicator.id,
      result: (allValidObjectives && allValidNames) ? 1 : 0,
      observation: (allValidObjectives && allValidNames)
        ? 'Todas las secciones tienen objetivos de la unidad válidos y nombres correctos'
        : observation.trim()
    };
  }

  private isValidUnitName(section: any, configName: string): boolean {
    return section.name.toLowerCase().includes(configName);
  }

  private isValidUnitObjective(section: any): boolean {
    // Extraer el campo `summary` y asegurarse de que sea un string
    const summary = section.summary || '';

    // Crear el DOM usando JSDOM
    const dom = new JSDOM(summary);
    const document = dom.window.document;

    // Buscar el título "Objetivo de la Unidad:"
    const element = Array.from(document.querySelectorAll('b, strong')) as HTMLElement[];
    const titleElement = element.find(el => {
      const normalizedText = el.textContent?.toLowerCase().trim().replace(/\s+/g, ' '); // Normaliza espacios múltiples
      return normalizedText?.includes('objetivo');
    });


    // Validar si hay contenido significativo después del título
    let hasContent = false;
    if (titleElement && titleElement.parentElement) {
      // Buscar elementos hermanos posteriores al título
      let nextSibling = titleElement.parentElement.nextElementSibling;
      while (nextSibling) {
        // Verificar si el elemento tiene texto relevante
        const content = nextSibling.textContent || '';
        if (content.trim().length > 0) {
          hasContent = true;
          break;
        }
        nextSibling = nextSibling.nextElementSibling;
      }
    }

    return hasContent;
  }

  private evaluateAccessRestrictions(indicator: any, matchedContent: any): IndicatorResult {
    // Filtrar las secciones relacionadas con "unidad"
    const lessonSections = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Array para guardar las secciones que no cumplen
    const nonCompliantSections = [];

    // Validar cada sección usando la función de restricciones
    const validAvailabilitySections = lessonSections.filter(section => {
      const isValid = this.hasAvailabilityRestrictions(section);
      if (!isValid) {
        nonCompliantSections.push(section.name); // Agregar las secciones no válidas
      }
      return isValid;
    });

    // Verificar si todas las secciones cumplen con las restricciones
    const allRestrictions = validAvailabilitySections.length === lessonSections.length;

    return {
      indicatorId: indicator.id,
      result: allRestrictions ? 1 : 0,
      observation: allRestrictions
        ? 'Cumple con las restricciones de acceso.'
        : `No cumplen con las restricciones de acceso las siguientes secciones: \n${nonCompliantSections.join(', \n')}.`,
    };
  }

  private hasAvailabilityRestrictions(module: any): boolean {
    if (!module.availabilityinfo) return false;

    // Verificar si la sección no está disponible
    const isNotAvailable = module.availabilityinfo.toLowerCase().includes('no disponible');
    return isNotAvailable;
  }

  /**
   * Funciones auxiliares para evaluar indicadores de Lecciones 
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private evaluateCompletionActivity(indicator: any, matchedContent: any): IndicatorResult {
    // Filtrar las secciones relacionadas con "unidad"
    const sections = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Filtrar los módulos de tipo "lesson" de todas las secciones
    const lessons = sections.flatMap(section =>
      section.modules?.filter(module => module.modname === 'lesson') || []
    );

    // Array para guardar las lecciones que no cumplen
    const nonCompliantLessons = [];

    // Validar cada lección usando la función de finalización
    const validAvailabilitySections = lessons.filter(lesson => {
      const isValid = this.hasCompletionData(lesson);
      if (!isValid) {
        nonCompliantLessons.push(lesson.name); // Agregar las lecciones no válidas
      }
      return isValid;
    });

    // Verificar si todas las lecciones cumplen con la configuración de finalización
    const allRestrictions = validAvailabilitySections.length === lessons.length;

    return {
      indicatorId: indicator.id,
      result: allRestrictions ? 1 : 0,
      observation: allRestrictions
        ? 'Cumple con la configuración de finalización de todas las actividades.'
        : `Las siguientes actividades no cumplen con la configuración de finalización: \n${nonCompliantLessons.join(', \n')}.`,
    };
  }

  private hasCompletionData(moduleContent: any): boolean {
    if (!moduleContent.completiondata) return false;
    // Verificar si la finalización es automática y si se alcanza el final
    const isAutomatic = moduleContent.completiondata.isautomatic;
    const isEndReached = moduleContent.completiondata.details?.some(
      detail => detail.rulename === 'completionendreached'
    );

    return isAutomatic && isEndReached;
  }

  private async evaluateRedirectionPage(indicator: any, sections: any[], token: string): Promise<IndicatorResult> {
    try {
      // Filtrar las secciones que contienen la palabra "unidad"
      const lessonSections = sections.filter(section =>
        section && section.name.toLowerCase().includes('unidad')
      );

      // Obtener los módulos de tipo "lesson" de las secciones filtradas
      const lessons = lessonSections.flatMap(section =>
        section.modules.filter(module => module.modname === 'lesson')
      );

      // Verificar redirecciones para cada lección
      const { isRedirectionCorrect, nonCompliantLessons } = await this.isRedirectionCorrectToLessons(lessons, token);

      // Crear y devolver el IndicatorResult
      return {
        indicatorId: indicator.id,
        result: isRedirectionCorrect ? 1 : 0,
        observation: isRedirectionCorrect
          ? 'Cumple con la configuración para respuestas incorrectas.'
          : `No cumplen con la configuración las siguientes lecciones: \n${nonCompliantLessons.join(', \n')}.`,
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

  private async isRedirectionCorrectToLessons(lessons: any[], token: string): Promise<{ isRedirectionCorrect: boolean, nonCompliantLessons: string[] }> {
    const nonCompliantLessons: string[] = [];

    const results = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          const isCorrect = await this.isRedirectionCorrect(lesson, token);
          if (!isCorrect) {
            nonCompliantLessons.push(lesson.name); // Agregar la lección que no cumple
          }
          return isCorrect;
        } catch (error) {
          console.error(`Error procesando la lección ${lesson.instance}:`, error);
          nonCompliantLessons.push(lesson.name); // Considera las lecciones con error como incorrectas
          return false;
        }
      })
    );

    // Verificar si al menos 4 lecciones cumplen
    const lessonsWithJumpsCorrect = results.filter(result => result === true).length;
    return {
      isRedirectionCorrect: lessonsWithJumpsCorrect >= 4,
      nonCompliantLessons,
    };
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
   * Funciones auxiliares para evaluar indicadores de Cuestionarios
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private async evaluateTimingQualificationQuizzes(indicator: any, matchedContent: any, token: string, courseid: number): Promise<IndicatorResult> {
    // Buscar "Cuestionario de autoevaluación" dentro del array de recursos
    const quizConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'cuestionario de autoevaluación'
    );

    // Verificar si la configuración del cuestionario existe
    if (!quizConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Cuestionario de autoevaluación" no encontrada en el archivo de configuración.',
      };
    }

    const config = quizConfig['timing-qualification'];
    const unitsSection = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Procesar los cuestionarios en las secciones y validar configuración
    const quizResults = await this.checkQuizzesInSections(unitsSection, courseid, token, config);

    // Filtrar los cuestionarios que no cumplen
    const nonCompliantQuizzes = quizResults.filter(result => !result.isValid).map(result => result.name);

    // Evaluar si todos los cuestionarios cumplen con la configuración
    const allQuizzesValid = nonCompliantQuizzes.length === 0;

    return {
      indicatorId: indicator.id,
      result: allQuizzesValid ? 1 : 0,
      observation: allQuizzesValid
        ? 'Todos los cuestionarios cumplen con la configuración de temporalización y calificación.'
        : `Los siguientes cuestionarios no cumplen: \n${nonCompliantQuizzes.join(', \n')}.`,
    };
  }

  private async checkQuiz(quiz: any, courseid: number, token: string, config: any): Promise<{ isValid: boolean, name: string }> {
    try {
      // Verificar si el cuestionario tiene fechas configuradas
      const hasDates = quiz.dates != null;

      // Obtener los datos de los cuestionarios desde Moodle
      const quizzesFromMoodle = await this.moodleService.getQuizzesByCourse(courseid, token);
      const quizData = quizzesFromMoodle?.quizzes?.find((item) => item.coursemodule == quiz.id);

      if (quizData) {
        // Verificar configuración específica del cuestionario
        const isAutosubmit = quizData.overduehandling === config.submission;
        const hasGradePeriod = quizData.graceperiod === config.graceperiod;
        const hasTimeLimit = quizData.timelimit <= config.timelimit || quizData.timelimit >= 300;
        const hasGradeMethod = quizData.grademethod === config.grademethod;

        const isValid = isAutosubmit && hasGradePeriod && hasTimeLimit && hasGradeMethod && hasDates;
        return { isValid, name: quiz.name };
      }
    } catch (error) {
      console.error(`Error verificando el cuestionario ${quiz.id}:`, error);
    }

    return { isValid: false, name: quiz.name };
  }

  private async checkQuizzesInSections(sections: any[], courseid: number, token: string, config: any): Promise<{ isValid: boolean, name: string }[]> {
    // Filtrar los módulos de tipo "quiz" de todas las secciones
    const quizzes = sections.flatMap(section =>
      section.modules.filter(module => module.modname === 'quiz')
    );

    // Verificar cada cuestionario usando la función checkQuiz
    const quizValidationResults = await Promise.all(
      quizzes.map(async (quiz) => this.checkQuiz(quiz, courseid, token, config))
    );

    return quizValidationResults;
  }

  private evaluateAccessRestrictionsQuizzes(indicator: any, matchedContent: any): IndicatorResult {
    // Filtrar las secciones relacionadas con "unidad"
    const sections = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Filtrar los módulos de tipo "quiz" de todas las secciones
    const quizzes = sections.flatMap(section =>
      section.modules?.filter(module => module.modname === 'quiz') || []
    );

    // Validar cada módulo (quiz) para verificar restricciones de acceso
    const invalidQuizzes = quizzes.filter(quiz => !this.hasAvailabilityRestrictionsQuiz(quiz));

    // Verificar si todos los cuestionarios tienen restricciones válidas
    const allRestrictionsValid = invalidQuizzes.length === 0;

    return {
      indicatorId: indicator.id,
      result: allRestrictionsValid ? 1 : 0,
      observation: allRestrictionsValid
        ? 'Cumple con las restricciones de acceso.'
        : `Los siguientes cuestionarios no cumplen con las restricciones de acceso: \n${invalidQuizzes.map(quiz => quiz.name).join(', \n')}`,
    };
  }

  private hasAvailabilityRestrictionsQuiz(module: any): boolean {
    if (!module || !module.availability) return false;

    // Verificar si el texto 'no disponible' está presente en la información de restricciones
    return module.availabilityinfo != null || module.availability != null;
  }

  private evaluateCompletionActivityQuizzes(indicator: any, matchedContent: any, token: string, courseid: number): IndicatorResult {
    const sections = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Filtrar los módulos de tipo "quiz" de todas las secciones
    const quizzes = sections.flatMap(section =>
      section.modules?.filter(module => module.modname === 'quiz') || []
    );

    // Validar cada cuestionario para verificar si cumple con los datos de finalización
    const invalidQuizzes = quizzes.filter(quiz => !this.hasGradeMethodQuiz(quiz, courseid, token));

    // Verificar si todos los cuestionarios cumplen con la configuración
    const allRestrictions = invalidQuizzes.length === 0;

    return {
      indicatorId: indicator.id,
      result: allRestrictions ? 1 : 0,
      observation: allRestrictions
        ? 'Todos los cuestionarios cumplen con la configuración de finalización de la actividad.'
        : `Los siguientes cuestionarios no cumplen con la configuración de finalización: \n${invalidQuizzes.map(quiz => quiz.name).join(', \n')}`,
    };
  }

  private async hasGradeMethodQuiz(quiz: any, courseid: number, token: string): Promise<{ isValid: boolean, name: string }> {
    try {
      // Verificar si el cuestionario tiene fechas configuradas
      const hasCompletionData = this.hasCompletionDataQuiz(quiz);

      // Obtener los datos de los cuestionarios desde Moodle
      const quizzesFromMoodle = await this.moodleService.getQuizzesByCourse(courseid, token);
      const quizData = quizzesFromMoodle?.quizzes?.find((item) => item.coursemodule == quiz.id);

      if (quizData) {
        // Verificar configuración específica del cuestionario
        const hasGradeMethod = quizData.grademethod === 1;
        const isValid = hasCompletionData && hasGradeMethod;
        return { isValid, name: quiz.name };
      }
    } catch (error) {
      console.error(`Error verificando el cuestionario ${quiz.id}:`, error);
    }

    return { isValid: false, name: quiz.name };
  }

  private hasCompletionDataQuiz(module: any): boolean {
    if (!module.completiondata) return false;

    const isAutomatic = module.completiondata.isautomatic;
    const isEndReached = module.completiondata.details?.some(
      detail => detail.rulename === 'completionview'
    );

    return isAutomatic && isEndReached;
  }

  private async evaluateEsquemaQuiz(indicator: any, matchedContent: any, token: string, courseid: number): Promise<IndicatorResult> {
    const unitsSection = matchedContent.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    // Procesar los cuestionarios en las secciones y validar configuración
    const quizResults = await this.checkEsquemaQuizzesInSections(unitsSection, courseid, token);

    // Filtrar los cuestionarios que no cumplen
    const nonCompliantQuizzes = quizResults.filter(result => !result.isValid).map(result => result.name);

    // Evaluar si todos los cuestionarios cumplen con la configuración
    const allQuizzesValid = nonCompliantQuizzes.length === 0;

    return {
      indicatorId: indicator.id,
      result: allQuizzesValid ? 1 : 0,
      observation: allQuizzesValid
        ? 'Todos los cuestionarios cumplen con la configuración del esquema, comportamiento de las preguntas y  opciones de revisión.'
        : `Los siguientes cuestionarios no cumplen: \n${nonCompliantQuizzes.join(', \n')}.`,
    };
  }

  private async checkEsquemaQuizzesInSections(sections: any[], courseid: number, token: string): Promise<{ isValid: boolean, name: string }[]> {
    // Filtrar los módulos de tipo "quiz" de todas las secciones
    const quizzes = sections.flatMap(section =>
      section.modules.filter(module => module.modname === 'quiz')
    );

    // Verificar cada cuestionario usando la función checkQuiz
    const quizValidationResults = await Promise.all(
      quizzes.map(async (quiz) => this.checkEsquemaQuiz(quiz, courseid, token))
    );

    return quizValidationResults;
  }

  private async checkEsquemaQuiz(quiz: any, courseid: number, token: string): Promise<{ isValid: boolean, name: string }> {
    try {
      // Verificar si el cuestionario tiene fechas configuradas
      const hasDates = quiz.dates != null;

      // Obtener los datos de los cuestionarios desde Moodle
      const quizzesFromMoodle = await this.moodleService.getQuizzesByCourse(courseid, token);
      const quizData = quizzesFromMoodle?.quizzes?.find((item) => item.coursemodule == quiz.id);

      if (quizData) {
        // Verificar configuración específica del cuestionario
        const isOnePage = quizData.questionsperpage === 0;
        const isNavMethod = quizData.navmethod === 'free';
        const isShuffleAnswers = quizData.shuffleanswers === 1;
        const isPreferredBehaviour = quizData.preferredbehaviour === 'deferredfeedback';
        const isAttemptonLast = quizData.attemptonlast === 0;

        const isValid = isOnePage && isNavMethod && isShuffleAnswers && isPreferredBehaviour && isAttemptonLast;
        return { isValid, name: quiz.name };
      }
    } catch (error) {
      console.error(`Error verificando el cuestionario ${quiz.id}:`, error);
    }

    return { isValid: false, name: quiz.name };
  }

  /**
   * Funciones auxiliares para evaluar Retos
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private evaluateGeneralRetos(indicator: any, matchedContent: any): IndicatorResult {
    // Buscar "Retos" dentro del array de recursos
    const retoConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'retos'
    );

    // Verificar si la configuración de "Retos" existe
    if (!retoConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Retos" no encontrada en el archivo de configuración.',
      };
    }

    // Validar cada reto
    const invalidRetos = matchedContent
      .filter(content => !this.checkGeneralConfigReto(content))
      .map(reto => ({
        name: reto.name || 'Sin nombre',
        issues: this.getGeneralConfigIssues(reto),
      }));

    // Verificar si todos los retos son válidos
    const allValidAssigns = invalidRetos.length === 0;

    const observation = allValidAssigns
      ? 'Todos los retos cumplen con la configuración general.'
      : `No cumple con los indicadores. Retos inválidos (${invalidRetos.length}):\n${invalidRetos
        .map(reto => `- ${reto.name}: ${reto.issues.join(', ')}`)
        .join('\n')}`;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation,
    };
  }

  private checkGeneralConfigReto(section: any): boolean {
    const hasName = section.name != null;
    const hasInstructions = section.intro != null;
    const hasContentFiles = section.introattachments?.length > 0 || false;

    return hasName && hasInstructions && hasContentFiles;
  }

  private getGeneralConfigIssues(section: any): string[] {
    const issues = [];
    if (!section.name) issues.push('Falta el nombre del reto');
    if (!section.intro) issues.push('Faltan las instrucciones');
    if (!(section.introattachments?.length > 0)) issues.push('Faltan los archivos adjuntos');
    return issues;
  }

  private evaluateAvailabilityRetos(indicator: any, matchedContent: any): IndicatorResult {
    const retoConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'retos'
    );

    // Verificar si la configuración de "Retos" existe
    if (!retoConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Retos" no encontrada en el archivo de configuración.',
      };
    }

    const config = retoConfig.submission;
    // Filtrar retos inválidos según la configuración
    const invalidRetos = matchedContent
      .filter(content => !this.checkAvailabilityConfigs(content, config))
      .map(reto => ({
        name: reto.name || 'Sin nombre',
        issues: this.getAvailabilityConfigIssues(reto, config),
      }));

    // Determinar si todos los retos cumplen
    const allValidAssigns = invalidRetos.length === 0;

    // Generar observaciones detalladas con los nombres de los retos que no cumplen
    const observation = allValidAssigns
      ? 'Todos los retos cumplen con la configuración de disponibilidad.'
      : `No cumple con la configuración. Retos inválidos (${invalidRetos.length}):\n${invalidRetos
        .map(reto => `- ${reto.name}: ${reto.issues.join(', ')}`)
        .join('\n')}`;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation,
    };
  }

  private checkAvailabilityConfigs(reto: any, config: any): boolean {
    const configs = reto.configs;

    if (!Array.isArray(configs)) return false;

    const findConfig = (plugin: string, subtype: string, name: string) =>
      configs.find(config => config.plugin === plugin && config.subtype === subtype && config.name === name);

    try {
      let validConditions = 0;

      // Validación: Tipos de entrega habilitados
      const fileSubmission = findConfig('file', 'assignsubmission', 'enabled');
      if (fileSubmission && fileSubmission.value === '1') {
        validConditions++;
      } else {
        console.warn('Tipos de entrega no habilitados.');
      }

      // Validación: Número máximo de archivos
      const maxFileSubmissions = findConfig('file', 'assignsubmission', 'maxfilesubmissions');
      if (maxFileSubmissions && parseInt(maxFileSubmissions.value, 10) >= 1) {
        validConditions++;
      } else {
        console.warn('Número máximo de archivos incorrecto.');
      }

      // Validación: Tamaño máximo de entrega
      const maxSubmissionSize = findConfig('file', 'assignsubmission', 'maxsubmissionsizebytes');
      const maxSubmissionLimit = config.maxsubmissionsizebytes; // Límite máximo permitido
      if (maxSubmissionSize && Number(maxSubmissionSize.value) / 1024 / 1024 > maxSubmissionLimit) {
        validConditions++;
      } else {
        console.warn('Tamaño máximo de entrega no es válido o excede el límite.');
      }

      // Validación: Retroalimentación habilitada
      const feedbackComments = findConfig('comments', 'assignfeedback', 'enabled');
      if (feedbackComments && feedbackComments.value === '1') {
        validConditions++;
      } else {
        console.warn('Retroalimentación no habilitada.');
      }

      // Validación: Comentarios en línea
      const inlineComments = findConfig('comments', 'assignfeedback', 'commentinline');
      if (inlineComments && inlineComments.value === config.commentinline) {
        validConditions++;
      } else {
        console.warn('Configuración de comentarios en línea incorrecta.');
      }

      return validConditions >= 2;
    } catch (error) {
      console.error(`Error al verificar el reto "${reto.name || 'Sin nombre'}":`, error);
      return false;
    }
  }

  private getAvailabilityConfigIssues(reto: any, config: any): string[] {
    const issues = [];
    const configs = reto.configs;

    if (!configs || !Array.isArray(configs)) {
      issues.push('Configuración ausente.');
      return issues;
    }

    const findConfig = (plugin: string, subtype: string, name: string) =>
      configs.find(config => config.plugin === plugin && config.subtype === subtype && config.name === name);

    let validConditions = 0;

    // Verificación: Tipos de entrega habilitados
    const fileSubmission = findConfig('file', 'assignsubmission', 'enabled');
    if (fileSubmission && fileSubmission.value === '1') {
      validConditions++;
    } else {
      issues.push('Tipos de entrega no habilitados.');
    }

    // Verificación: Número máximo de archivos
    const maxFileSubmissions = findConfig('file', 'assignsubmission', 'maxfilesubmissions');
    if (maxFileSubmissions && parseInt(maxFileSubmissions.value, 10) >= 1) {
      validConditions++;
    } else {
      issues.push('Número máximo de archivos incorrecto.');
    }

    // Verificación: Tamaño máximo de entrega
    const maxSubmissionSize = findConfig('file', 'assignsubmission', 'maxsubmissionsizebytes');
    const maxSubmissionLimit = config.maxsubmissionsizebytes; // Límite máximo permitido
    if (maxSubmissionSize && Number(maxSubmissionSize.value) / 1024 / 1024 > maxSubmissionLimit) {
      validConditions++;
    } else {
      issues.push(`Tamaño máximo de entrega no válido. Tamaño actual: ${maxSubmissionSize ? Number(maxSubmissionSize.value) / 1024 / 1024 : 'no configurado'} MB`);
    }

    // Verificación: Retroalimentación habilitada
    const feedbackComments = findConfig('comments', 'assignfeedback', 'enabled');
    if (feedbackComments && feedbackComments.value === '1') {
      validConditions++;
    } else {
      issues.push('Retroalimentación no habilitada.');
    }

    // Verificación: Comentarios en línea
    const inlineComments = findConfig('comments', 'assignfeedback', 'commentinline');
    if (inlineComments && inlineComments.value === config.commentinline) {
      validConditions++;
    } else {
      issues.push('Configuración de comentarios en línea incorrecta.');
    }

    issues.unshift(`Condiciones válidas: ${validConditions}/5. Deben cumplirse al menos 2 condiciones para que el reto sea válido.`);

    return issues;
  }

  private async evaluateCompletionDataRetos(indicator: any, matchedContent: any, courseId: number, token: string): Promise<IndicatorResult> {
    const courseContents = await this.moodleService.getCourseContents(courseId, token);

    const sections = courseContents.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    const assigns = sections.flatMap(section =>
      section.modules?.filter(module => module.modname === 'assign' && !module.name.toLowerCase().includes('tarea')) || []
    );
    const invalidAssigns = assigns.filter(assign => !this.hasCompletionDataRetos(assign));
    const allRestrictions = invalidAssigns.length === 0;

    return {
      indicatorId: indicator.id,
      result: allRestrictions ? 1 : 0,
      observation: allRestrictions
        ? 'Todos los retos cumplen con la configuración de finalización de la actividad.'
        : `Los siguientes retos no cumplen con la configuración de finalización: \n${invalidAssigns.map(assign => assign.name).join(', \n')}`,
    };
  }

  private hasCompletionDataRetos(module: any): boolean {
    if (!module.completiondata) return false;

    //const isAutomatic = module.completiondata.isautomatic;
    const isEndReached = module.completiondata.details?.some(
      detail => detail.rulename === 'completionsubmit'
    );

    //return isAutomatic && isEndReached;
    return isEndReached;
  }

  private evaluateSubmissionRetos(indicator: any, matchedContent: any): IndicatorResult {
    // Filtrar retos inválidos según la configuración
    const invalidRetos = matchedContent
      .filter(content => !this.checkSubmissionConfigs(content))
      .map(reto => ({
        name: reto.name || 'Sin nombre',
        issues: this.getSubmissionConfigIssues(reto),
      }));

    // Determinar si todos los retos cumplen
    const allValidAssigns = invalidRetos.length === 0;

    // Generar observaciones detalladas con los nombres de los retos que no cumplen
    const observation = allValidAssigns
      ? 'Todos los retos cumplen con la configuración de entrega.'
      : `No cumple con la configuración. Retos inválidos (${invalidRetos.length}):\n${invalidRetos
        .map(reto => `- ${reto.name}: ${reto.issues.join(', ')}`)
        .join('\n')}`;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation,
    };
  }

  private checkSubmissionConfigs(reto: any): boolean {
    try {
      let validConditions = 0;

      // Validación:Requiere que los alumnos pulsen el botón de envío
      const requireBotonEnvio = reto.nosubmissions;
      if (requireBotonEnvio === 0) {
        validConditions++;
      } else {
        console.warn('Los alumnos pueden pulsar el botón de envío.');
      }

      // Validación: Es necesario que los estudiantes acepten las condiciones de entrega
      const aceptarCondicionesEntrega = reto.requiresubmissionstatement;
      if (aceptarCondicionesEntrega === 0) {
        validConditions++;
      } else {
        console.warn('Los estudiantes deben aceptar las condiciones de entrega.');
      }

      // Validación: Intentos adicionales 
      const intentosAdicionales = reto.attemptreopenmethod;
      if (intentosAdicionales === 'none') {
        validConditions++;
      } else {
        console.warn('Se pueden hacer intentos adicionales.');
      }

      return validConditions >= 2;
    } catch (error) {
      console.error(`Error al verificar el reto "${reto.name || 'Sin nombre'}":`, error);
      return false;
    }
  }

  private getSubmissionConfigIssues(reto: any): string[] {
    const issues = [];

    let validConditions = 0;

    const requireBotonEnvio = reto.nosubmissions;
    if (requireBotonEnvio === 0) {
      validConditions++;
    } else {
      issues.push('Requiere que los alumnos pulsen el botón de envío.');
    }

    // Validación: Es necesario que los estudiantes acepten las condiciones de entrega
    const aceptarCondicionesEntrega = reto.requiresubmissionstatement;
    if (aceptarCondicionesEntrega === 0) {
      validConditions++;
    } else {
      issues.push('Requiere que los estudiantes acepten las condiciones de entrega.');
    }

    // Validación: Intentos adicionales 
    const intentosAdicionales = reto.attemptreopenmethod;
    if (intentosAdicionales === 'none') {
      validConditions++;
    } else {
      issues.push('Permite a los estudiantes realizar intentos adicionales.');
    }

    issues.unshift(`Condiciones válidas: ${validConditions}/5. Deben cumplirse al menos 2 condiciones para que el reto sea válido.`);

    return issues;
  }

  private evaluateGradingRetos(indicator: any, matchedContent: any): IndicatorResult {
    // Filtrar retos inválidos según la configuración
    const invalidRetos = matchedContent
      .filter(content => !this.checkGradingConfigs(content))
      .map(reto => ({
        name: reto.name || 'Sin nombre',
        issues: this.getGradingConfigIssues(reto),
      }));

    // Determinar si todos los retos cumplen
    const allValidAssigns = invalidRetos.length === 0;

    // Generar observaciones detalladas con los nombres de los retos que no cumplen
    const observation = allValidAssigns
      ? 'Todos los retos cumplen con la configuración de la calificación.'
      : `No cumple con la configuración. Retos inválidos (${invalidRetos.length}):\n${invalidRetos
        .map(reto => `- ${reto.name}: ${reto.issues.join(', ')}`)
        .join('\n')}`;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation,
    };
  }

  private checkGradingConfigs(reto: any): boolean {
    try {
      let validConditions = 0;

      // Validación:Envíos anónimos
      const enviosAnonimos = reto.blindmarking;
      if (enviosAnonimos === 0) {
        validConditions++;
      } else {
        console.warn('Los envíos anónimos estan permitidos.');
      }

      // Validación: Workflow de calificaciones
      const usarWorkflowCalificaciones = reto.markingworkflow;
      if (usarWorkflowCalificaciones === 0) {
        validConditions++;
      } else {
        console.warn('Se está utilizando el Workflow de calificaciones.');
      }

      return validConditions >= 2;
    } catch (error) {
      console.error(`Error al verificar el reto "${reto.name || 'Sin nombre'}":`, error);
      return false;
    }
  }

  private getGradingConfigIssues(reto: any): string[] {
    const issues = [];

    let validConditions = 0;

    // Validación:Envíos anónimos
    const enviosAnonimos = reto.blindmarking;
    if (enviosAnonimos === 0) {
      validConditions++;
    } else {
      issues.push('Están permitidos los envíos anónimos.');
    }

    // Validación: Workflow de calificaciones
    const usarWorkflowCalificaciones = reto.markingworkflow;
    if (usarWorkflowCalificaciones === 0) {
      validConditions++;
    } else {
      issues.push('Se está utilizando el Workflow de calificaciones.');
    }

    issues.unshift(`Condiciones válidas: ${validConditions}/5. Deben cumplirse al menos 2 condiciones para que el reto sea válido.`);

    return issues;
  }

  /**
   * Funciones auxiliares para evaluar Foros
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private evaluateGeneralForos(indicator: any, matchedContent: any): IndicatorResult {
    const foroConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'foro de debate'
    );

    // Verificar si la configuración de "Foro de debate" existe
    if (!foroConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Foro de debate" no encontrada en el archivo de configuración.',
      };
    }

    const config = foroConfig.general; // Acceder a la propiedad 'general'

    // Identificar foros que no cumplen con la configuración
    const invalidForos = matchedContent
      .filter(content =>
        !this.shouldExcludeForo(content) && // Excluir si es un foro de tipo "video de presentación"
        !this.checkGeneralConfigForo(content, config) // Evaluar solo si no es excluido
      )
      .map(content => {
        const issues = [];
        if (!content.name.toLowerCase().includes(config.name)) {
          issues.push('nombre inválido (no empieza con "Debate de la Unidad...")');
        }
        if (!content.intro) {
          issues.push('falta de descripción');
        }
        if ((content.type !== config.type)) {
          issues.push(`tipo incorrecto (esperado: ${config.tipo})`);
        }
        return { name: content.name || 'Sin nombre', issues: issues.join(', ') };
      });

    // Verificar si todos los foros son válidos
    const allValidAssigns = invalidForos.length === 0;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation: allValidAssigns
        ? 'Todos los foros cumplen con la configuración general.'
        : `No cumple con el indicador. Foros inválidos (${invalidForos.length}):\n` +
        invalidForos.map(foro => `- ${foro.name}: ${foro.issues}`).join('\n'),
    };
  }

  private shouldExcludeForo(section: any): boolean {
    const name = section.name.toLowerCase();
    return name.includes('video de presentación') || name.includes('video');
  }

  private checkGeneralConfigForo(section: any, config: any): boolean {
    const isValidName = section.name.toLowerCase().includes(config.name);
    const hasInstructions = section.intro != null;
    const isValidType = section.type === config.type;
    return isValidName && hasInstructions && isValidType;
  }

  private evaluateAttachmentForos(indicator: any, matchedContent: any): IndicatorResult {
    const foroConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'foro de debate'
    );

    // Verificar si la configuración de "Foro de debate" existe
    if (!foroConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Foro de debate" no encontrada en el archivo de configuración.',
      };
    }

    const config = foroConfig.attachment; // Acceder a la propiedad 'attachment'

    // Identificar foros que no cumplen con la configuración
    const invalidForos = matchedContent
      .filter(content =>
        !this.shouldExcludeForo(content) && // Excluir si es un foro de tipo "video de presentación"
        !this.checkAttachmentConfigForo(content, config) // Evaluar solo si no es excluido
      )
      .map(content => {
        const issues = [];
        if (content.maxattachments !== config.maxfiles) {
          issues.push(`máximo de archivos adjuntos (esperado: ${config.maxfiles}, encontrado: ${content.maxattachments || 'n/a'})`);
        }
        if (content.maxbytes < 0) {
          issues.push('tamaño máximo de archivos inválido');
        }
        if (content.forcesubscribe !== 0) {
          issues.push('la suscripción no está desactivada');
        }
        /* if (content.blockafter !== 0) {
            issues.push('bloqueo después de publicaciones no está desactivado');
        } */
        return { name: content.name || 'Sin nombre', issues: issues.join(', ') };
      });

    // Verificar si todos los foros cumplen
    const allValidAssigns = invalidForos.length === 0;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation: allValidAssigns
        ? 'Todos los foros cumplen con la configuración de adjuntos, recuento de palabras, suscripción y seguimiento.'
        : `No cumple con el indicador. Foros inválidos (${invalidForos.length}):\n` +
        invalidForos.map(foro => `- ${foro.name}: ${foro.issues}`).join('\n'),
    };
  }

  private checkAttachmentConfigForo(section: any, config: any): boolean {
    const isValidAttachment = section.maxattachments === config.maxfiles;
    const hasMaxbytes = section.maxbytes >= 0;
    const isForceSubscribe = section.forcesubscribe === 0;
    //const isBlockAfter = section.blockafter === 0;
    return isValidAttachment && hasMaxbytes && isForceSubscribe;
  }

  private evaluateCompletionConfigForo(indicator: any, matchedContent: any): IndicatorResult {
    const filteredContent = matchedContent.filter(content =>
      content.name.toLowerCase().includes('unidad')
    );

    const validationResults = filteredContent.map(content => ({
      content,
      validation: this.checkCompletionForo(content)
    }));

    const validForos = validationResults.filter(({ validation }) => validation.isValid);
    const invalidForos = validationResults.filter(({ validation }) => !validation.isValid);

    const minValidForos = 3;
    const allValidForos = validForos.length >= minValidForos;

    return {
      indicatorId: indicator.id,
      result: allValidForos ? 1 : 0,
      observation: allValidForos
        ? `Cumple con el indicador. Foros válidos: ${validForos.length}.`
        : `No cumple con el indicador. Foros válidos: ${validForos.length}, Foros inválidos: ${invalidForos.length}.\n` +
        invalidForos
          .map(
            ({ content, validation }) =>
              `- ${content.name}: ${validation.issues.join(', ')}`
          )
          .join('\n')
    };
  }

  private checkCompletionForo(section: any): { isValid: boolean; issues: string[] } {
    const issues = [];
    if (section.completionposts === 0) {
      issues.push('Requiere mensajes');
    }
    if (section.completiondiscussions !== 0) {
      issues.push('No debe requerir debates');
    }
    if (section.completionreplies !== 0) {
      issues.push('No debe requerir réplicas');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private evaluateFreeForos(indicator: any, matchedContent: any): IndicatorResult {
    // Identificar foros que no cumplen con la configuración
    const invalidForos = matchedContent
      .filter(content => !this.checkFreeConfigForo(content))
      .map(content => {
        const issues = [];
        if (content.duedate != 0 || content.cutoffdate != 0) {
          issues.push('El foro no está abierto para todos.');
        }
        return { name: content.name || 'Sin nombre', issues: issues.join(', ') };
      });

    // Verificar si todos los foros son válidos
    const allValidAssigns = invalidForos.length === 0;

    return {
      indicatorId: indicator.id,
      result: allValidAssigns ? 1 : 0,
      observation: allValidAssigns
        ? 'Todos los foros cumplen con el indicador.'
        : `No cumple con el indicador. Foros inválidos (${invalidForos.length}):\n` +
        invalidForos.map(foro => `- ${foro.name}: ${foro.issues}`).join('\n'),
    };
  }

  private checkFreeConfigForo(section: any): boolean {
    const hasLimitParticipateDate = section.duedate == 0;
    const hasLimitAcceptDate = section.cutoffdate === 0;
    return hasLimitParticipateDate && hasLimitAcceptDate;
  }

  private async evaluateAccessForos(indicator: any, matchedContent: any, courseId: number, token: string): Promise<IndicatorResult> {
    const courseContents = await this.moodleService.getCourseContents(courseId, token);

    const sections = courseContents.filter(section =>
      section && section.name.toLowerCase().includes('unidad')
    );

    const forums = sections.flatMap(section =>
      section.modules?.filter(module => module.modname === 'forum' && !module.name.toLowerCase().includes('avisos')) || []
    );
    const invalidAssigns = forums.filter(forum => !this.hasRestrictionsForum(forum));
    const allRestrictions = invalidAssigns.length === 0;

    return {
      indicatorId: indicator.id,
      result: allRestrictions ? 1 : 0,
      observation: allRestrictions
        ? 'Todos los foros cumplen con la configuración de restricciones de acceso.'
        : `Los siguientes retos no cumplen con la configuración de restricciones: \n${invalidAssigns.map(forum => forum.name).join(', \n')}`,
    };
  }

  private hasRestrictionsForum(module: any): boolean {
    return module.availability == null;
  }

  /**
   * Funciones auxiliares para evaluar Videoconferencia Section
   * @param indicator 
   * @param matchedContent 
   * @returns 
   */
  private evaluateGeneralSectionVideo(indicator: any, matchedContent: any): IndicatorResult {
    const videoSection = matchedContent.find(section =>
      section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
    );

    const videoConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'videoconferencias'
    );

    // Verificar si la carpeta pedagógica existe en la configuración
    if (!videoConfig || !videoSection) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Videoconferencias" no encontrada.',
      };
    }

    const config = videoConfig.general; // Acceder a la propiedad 'general'
    const validNameSection = videoSection.name.toLowerCase().includes(config.name);
    const hasImgMapa = videoSection.summary.toLowerCase().includes(config.description);

    let observation = '';
    if (!validNameSection && !hasImgMapa) {
      observation = 'No cumple con el nombre de la sección ni con la descripción requerida.';
    } else if (!validNameSection) {
      observation = 'No cumple con el nombre de la sección.';
    } else if (!hasImgMapa) {
      observation = 'No cumple con la descripción requerida.';
    } else {
      observation = 'La sección de videoconferencia cumple con la configuración general.';
    }

    return {
      indicatorId: indicator.id,
      result: validNameSection && hasImgMapa ? 1 : 0,
      observation
    };
  }

  private evaluateGeneralBookVideo(indicator: any, matchedContent: any): IndicatorResult {
    const videoSection = matchedContent.find(section =>
      section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
    );

    const videoConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'videoconferencias'
    );

    // Verificar si la carpeta pedagógica existe en la configuración
    if (!videoConfig || !videoSection) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Configuración de "Videoconferencias" no encontrada.',
      };
    }

    const config = videoConfig.generalunit; // Acceder a la propiedad 'general'
    const moduleBook = videoSection.modules?.find(item => item.modname == 'book');
    if (!moduleBook) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontraron módulos tipo libro en la sección de videoconferencias'
      };
    }

    const isValidName = moduleBook.name.toLowerCase().includes(config.name);

    return {
      indicatorId: indicator.id,
      result: isValidName ? 1 : 0,
      observation: isValidName ? 'Cumple con la configuración general' : 'El libro no cumple con la configuración general'
    };
  }

  private hasPageForeachUnit(indicator: any, matchedResources: any[]): IndicatorResult {
    // Verificar que matchedResources no sea null o undefined
    if (!matchedResources || !Array.isArray(matchedResources)) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No hay recursos para evaluar'
      };
    }

    // Obtener las secciones únicas que no sean "videoconferencias"
    const uniqueSections = matchedResources.filter(section =>
      section &&
      typeof section === 'object' &&
      section.name &&
      section.name.toLowerCase() !== 'videoconferencias' || section.name.toLowerCase() !== 'videoconferencia'
    );
    const totalSubjects = uniqueSections.length;

    // Encontrar la sección "videoconferencias"
    const videoconferenciaSection = matchedResources.find(section =>
      section &&
      section.name &&
      section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
    );

    if (!videoconferenciaSection || !videoconferenciaSection.modules) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontró la sección de videoconferencias o no tiene módulos'
      };
    }

    // Filtrar módulos de la sección "videoconferencias" excluyendo los que tengan modname: "book"
    const moduleBook = videoconferenciaSection.modules.find(
      module => module.modname.toLowerCase() == 'book'
    );

    if (!moduleBook) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontraron módulos tipo libro en la sección de videoconferencias'
      };
    }

    const hasUrlForeachSubject = totalSubjects === moduleBook.contents?.filter(item => item.filename != 'structure').length;

    return {
      indicatorId: indicator.id,
      result: hasUrlForeachSubject ? 1 : 0,
      observation: hasUrlForeachSubject
        ? 'Cumple con el indicador'
        : `No se cumple con el indicador: ${totalSubjects} unidades - \nPáginas: ${moduleBook.filter(item => item.filename != 'structure').length}`
    };
  }

  private evaluateRestrictionsBookVideo(indicator: any, matchedContent: any): IndicatorResult {
    const videoSection = matchedContent.find(section =>
      section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
    );

    if (!videoSection) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Sección de "Videoconferencias" no encontrada.',
      };
    }

    const moduleBook = videoSection.modules?.find(item => item.modname == 'book');

    if (!moduleBook) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontraron módulos tipo libro en la sección de videoconferencias'
      };
    }

    const isAvailable = moduleBook.availability == null;

    return {
      indicatorId: indicator.id,
      result: isAvailable ? 1 : 0,
      observation: isAvailable ? 'Cumple con el indicador' : 'El libro tiene restricciones de acceso'
    };
  }

  private evaluateCompletionBookVideo(indicator: any, matchedContent: any): IndicatorResult {
    const videoSection = matchedContent.find(section =>
      section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
    );

    const videoConfig = technicalConfig.resources.find(resource =>
      resource.name.toLowerCase() === 'videoconferencias'
    );

    if (!videoSection || !videoConfig) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Sección de "Videoconferencias" no encontrada.',
      };
    }

    const config = videoConfig.completiondata;
    const moduleBook = videoSection.modules?.find(item => item.modname == 'book');
    if (!moduleBook) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontraron módulos tipo libro en la sección de videoconferencias'
      };
    }

    const isAutomatic = moduleBook.completiondata.isautomatic;
    const isAvailable = moduleBook.completiondata.details?.some(
      detail => detail.rulename === config.rulename
    );

    return {
      indicatorId: indicator.id,
      result: isAutomatic && isAvailable ? 1 : 0,
      observation: isAutomatic && isAvailable ? 'Cumple con el indicador' : 'No cumple con el indicador. El libro tiene restricciones de acceso.'
    };
  }

  private evaluateCompletionUrls(indicator: any, matchedResources: any[]): IndicatorResult {
    // Verificar que matchedResources no sea null o undefined
    if (!matchedResources || !Array.isArray(matchedResources)) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No hay recursos para evaluar'
      };
    }

    // Encontrar la sección "videoconferencias"
    const videoconferenciaSection = matchedResources.find(section =>
      section &&
      section.name &&
      section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
    );

    if (!videoconferenciaSection || !videoconferenciaSection.modules) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontró la sección de videoconferencias o no tiene módulos'
      };
    }

    // Filtrar módulos de la sección "videoconferencias" excluyendo los que tengan modname: "book"
    const modulesUrl = videoconferenciaSection.modules.filter(
      module => module.modname.toLowerCase() !== 'book'
    );

    // Separar los módulos válidos de los inválidos
    const invalidModules = modulesUrl.filter(module => !this.hasCompletionDataUrl(module));

    return {
      indicatorId: indicator.id,
      result: invalidModules.length === 0 ? 1 : 0,
      observation: invalidModules.length === 0
        ? 'Todos los módulos cumplen con los datos de finalización requeridos'
        : `No cumplen con los datos de finalización: \n${invalidModules.map(module => module.name).join(', \n')}`
    };
  }

  private hasCompletionDataUrl(moduleUrl: any): boolean {
    const isValid = moduleUrl.completiondata?.details?.some(item => item.rulename === "completionview");
    return isValid;
  }
}    
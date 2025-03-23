import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';
import { MoodleService } from 'src/moodle/moodle.service';

@Injectable()
export class Cycle3TechnicalDesignService {
  constructor(
    private readonly moodleService: MoodleService,
  ) { }

  evaluateIndicatorsByResource(
    resource: any,
    indicators: any[],
    matchedContent: any,
    token?: string,
    courseid?: number
  ): IndicatorResult[] {
    // Determina qué función evaluadora usar según el nombre del contenido
    const contentEvaluator = this.getResourceEvaluator(resource.name);

    if (!contentEvaluator) {
      // Si no hay evaluador para este contenido, marca todos los indicadores para revisión manual
      return indicators.map((indicator) => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El indicador "${indicator.name}" requiere verificación manual`,
      }));
    }

    // Evalúa los indicadores usando la función específica
    return contentEvaluator(indicators, matchedContent, token, courseid);
  }

  /**
   * Retorna la función evaluadora específica según el recurso
   */
  private getResourceEvaluator(resourceName: string): ((indicators: any[], matchedContent: any, token?: string, courseid?: number) => IndicatorResult[]) | null {
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

  private async evaluateMapaCierre(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = []; // Array para almacenar resultados

    if (matchedContent != null) {
      const indicatorHandlers = {
        'general': async (indicator: any) => {
          return this.evaluateGeneralMapaCierre(indicator, matchedContent)
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
  private async evaluateSummativeAssessment(indicators: any[], matchedContent: any, token: string, courseid: number): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    if (matchedContent != null) {
      const indicatorHandlers = {
        'restricciones extra': async (indicator: any) => {
          return this.checkExtraAttemptRestrictions(indicator, courseid, token)
        },
        'finalización': async (indicator: any) => {
          return this.checkRestrictionsLinkedToCompletion(indicator, matchedContent)
        },
        'configuración del esquema': async (indicator: any) => {
          return this.evaluateEsquemaQuiz(indicator, matchedContent, token, courseid)
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

  /**
   * Verifica si se cumplen las restricciones extra sobre los intentos
   */
  private async checkExtraAttemptRestrictions(indicator: any, courseid: number, token: string): Promise<IndicatorResult> {
    const quizzesMoodle = await this.moodleService.getQuizzesByCourse(courseid, token);
    const validQuizzes = quizzesMoodle.quizzes.filter(item => item.name.toLowerCase().includes('parcial'))
    let observation = '';

    for (const quiz of validQuizzes) {
      const issues: string[] = [];

      // Check password restriction
      if (quiz.password && quiz.password !== '') {
        issues.push('tiene contraseña requerida');
      }

      // Check network address restriction
      if (quiz.subnet && quiz.subnet !== '') {
        issues.push('tiene restricción de dirección de red');
      }

      // Check browser security
      if (quiz.browsersecurity && quiz.browsersecurity !== '' && quiz.browsersecurity !== '-') {
        issues.push('tiene restricción de seguridad del navegador');
      }

      // If any issues found, add to observation
      if (issues.length > 0) {
        observation += `\n- Evaluación ${quiz.id}: ${issues.join(', ')}`;
      }
    }

    return {
      indicatorId: indicator.id,
      result: observation === '' ? 1 : 0,
      observation: observation === ''
        ? 'Cumple con las configuraciones de restricciones sobre los intentos'
        : `No cumple con el indicador. Las siguientes evaluaciones tienen restricciones:${observation}`
    };
  }

  private async checkRestrictionsLinkedToCompletion(indicator: any, matchedContent: any): Promise<IndicatorResult> {
    const quizzes = matchedContent.modules.filter(
      (module: any) => module.modname === 'quiz',
    );

    let observation = '';

    for (const quiz of quizzes) {
      const issues: string[] = [];

      // Check availability configuration
      if (!quiz.availability) {
        issues.push('No tiene restricciones configuradas');
      } else {
        const availability = JSON.parse(quiz.availability);

        // Check number of conditions
        if (!availability.c || availability.c.length < 2) {
          issues.push('Requiere al menos 2 restricciones');
        }

        // Verify grade and date restrictions
        const hasGradeRestriction = availability.c?.some(
          (condition: any) => condition.type === 'grade',
        );
        const hasDateRestriction = availability.c?.some(
          (condition: any) => condition.type === 'date',
        );

        if (!hasGradeRestriction) {
          issues.push('No tiene restricción de nota');
        }

        if (!hasDateRestriction) {
          issues.push('No tiene restricción de fecha de finalización');
        }

        // Check date restriction configuration
        if (hasDateRestriction) {
          const dateRestriction = availability.c.find(
            (condition: any) => condition.type === 'date',
          );
          if (dateRestriction && dateRestriction.d !== '>=') {
            issues.push('Configuración de fecha de inicio inválida');
          }
        }
      }

      // Add quiz to observation if any issues found
      if (issues.length > 0) {
        observation += `\n- ${quiz.name}: ${issues.join(', ')}`;
      }
    }

    return {
      indicatorId: indicator.id,
      result: observation === '' ? 1 : 0,
      observation: observation === ''
        ? 'Todos los cuestionarios cumplen con las restricciones de restricciones de completación'
        : `No cumple con el indicador. Los siguientes cuestionarios tienen problemas de configuración:${observation}`
    };
  }

  private async evaluateEsquemaQuiz(indicator: any, matchedContent: any, token: string, courseid: number): Promise<IndicatorResult> {
    const quizModules = matchedContent.modules.filter(section =>
      section && section.modname.toLowerCase().includes('quiz')
    );

    // Verificar cada cuestionario usando la función checkQuiz
    const quizValidationResults = await Promise.all(
      quizModules.map(async (quiz) => this.checkEsquemaQuiz(quiz, courseid, token))
    );

    // Filtrar los cuestionarios que no cumplen
    const nonCompliantQuizzes = quizValidationResults.filter(result => !result.isValid).map(result => result.name);

    // Evaluar si todos los cuestionarios cumplen con la configuración
    const allQuizzesValid = nonCompliantQuizzes.length === 0;

    const assignModules = matchedContent.modules.filter(section =>
      section && section.modname.toLowerCase().includes('assign')
    );

    const assignValidationResults = await Promise.all(
      assignModules.map(async (assign) => this.checkGeneralConfigReto(assign))
    );


    return {
      indicatorId: indicator.id,
      result: allQuizzesValid ? 1 : 0,
      observation: allQuizzesValid
        ? 'Todos los cuestionarios cumplen con la configuración del esquema, comportamiento de las preguntas y  opciones de revisión.'
        : `Los siguientes cuestionarios no cumplen: \n${nonCompliantQuizzes.join(', \n')}.`,
    };
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

  private checkGeneralConfigReto(section: any): boolean {
    const hasName = section.name != null;
    const hasInstructions = section.intro != null;
    const hasContentFiles = section.introattachments?.length > 0 || false;

    return hasName && hasInstructions && hasContentFiles;
  }

  private evaluateGeneralMapaCierre(indicator: any, matchedContent: any): IndicatorResult {
    const isNameValid = matchedContent.name === 'Cierre';
    const isDescriptionValid = matchedContent.summary ? true : false; // Cambié la condición para comparar la descripción

    const result = isNameValid && isDescriptionValid ? 1 : 0;

    return {
      indicatorId: indicator.id,
      result,
      observation: result
        ? 'Cumple con la configuración general.'
        : 'No cumple con la configuración general.',
    };
  }
}

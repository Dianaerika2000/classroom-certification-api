import { Injectable } from '@nestjs/common';
import technicalConfig from '../technical-design-cycle-ii/config/technical-design-config.json';
import { JSDOM } from 'jsdom';
import { MoodleService } from 'src/moodle/moodle.service';
import { IndicatorResult } from '../../organizational-aspects/config/indicator-result';

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
                observation: `El contenido ${content.name} requiere verificación manual`
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
            'Sección de Videoconferencia/Mapa de videoconferencia': this.evaluateVideoconferencias.bind(this),
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
                        observation: 'Este indicador requiere verificación manual',
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
                        observation: 'Este indicador requiere verificación manual',
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
                'restricciones': async (indicator: any) => {
                    return this.evaluateAccessRestrictionsQuizzes(indicator, matchedContent);
                },
                'finalización': async (indicator: any) => {
                    return this.evaluateCompletionActivityQuizzes(indicator, matchedContent);
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
                /* 'finalización': async (indicator: any) => {
                    return this.evaluateCompletionActivityQuizzes(indicator, matchedContent);
                } */
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

        return results; // Devuelve un array de resultados
    }

    /**
     * Función para evaluar los indicadores de Cuestionarios
     * @param indicators 
     * @param matchedContent 
     * @returns 
     */
    private async evaluateForos(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const indicatorHandlers = {
                'general': async (indicator: any) => {
                    return this.evaluateGeneralForos(indicator, matchedContent)
                },
                'adjuntos': async (indicator: any) => {
                    return this.evaluateAttachmentForos(indicator, matchedContent);
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
                        observation: 'Este indicador requiere verificación manual',
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
    private async evaluateVideoconferencias(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const indicatorHandlers = {
                'cumple la configuración general': async (indicator: any) => {
                    return this.evaluateGeneralSectionVideo(indicator, matchedContent)
                },
                'cumple con la finalización': async (indicator: any) => {
                    return this.evaluateCompletionUrls(indicator, matchedContent)
                },
                'contiene la configuración general': async (indicator: any) => {
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
                        observation: 'Este indicador requiere verificación manual',
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
        // Buscar "Carpeta pedagógica" dentro del array de recursos
        const mapaMentalConfig = technicalConfig.resources.find(resource =>
            resource.name.toLowerCase() === 'mapa mental'
        );

        // Verificar si la carpeta pedagógica existe en la configuración
        if (!mapaMentalConfig) {
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'Configuración de "Mapa Mental" no encontrada en el archivo de configuración.',
            };
        }

        const config = mapaMentalConfig.general; // Acceder a la propiedad 'general'
        const lessonSections = matchedContent.filter(section =>
            section && section.name.toLowerCase().includes('unidad')
        );

        // Validar cada sección usando ambas funciones
        const validObjectiveSections = lessonSections.filter(this.isValidUnitObjective);
        const validNameSections = lessonSections.filter(section => this.isValidUnitName(section, config.name));

        // Verificar si todas las secciones tienen objetivos válidos y nombres válidos
        const allValidObjectives = validObjectiveSections.length === lessonSections.length;
        const allValidNames = validNameSections.length === lessonSections.length;

        return {
            indicatorId: indicator.id,
            result: (allValidObjectives && allValidNames) ? 1 : 0,
            observation: (allValidObjectives && allValidNames)
                ? 'Todas las secciones tienen objetivos de la unidad válidos y nombres correctos'
                : `Secciones inválidas - Objetivos: ${lessonSections.length - validObjectiveSections.length}, Nombres: ${matchedContent.length - validNameSections.length}`
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
        const titleElement = element.find(el => el.textContent?.toLowerCase().includes('objetivo de la unidad'));

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
                : `No cumplen con las restricciones de acceso las siguientes secciones: ${nonCompliantSections.join(', ')}.`,
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
                : `Las siguientes actividades no cumplen con la configuración de finalización: ${nonCompliantLessons.join(', ')}.`,
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
                    : `No cumplen con la configuración las siguientes lecciones: ${nonCompliantLessons.join(', ')}.`,
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
                : `Los siguientes cuestionarios no cumplen: ${nonCompliantQuizzes.join(', ')}.`,
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
                : `Los siguientes cuestionarios no cumplen con las restricciones de acceso: ${invalidQuizzes.map(quiz => quiz.name).join(', ')}`,
        };
    }

    private hasAvailabilityRestrictionsQuiz(module: any): boolean {
        if (!module || !module.availability) return false;

        // Verificar si el texto 'no disponible' está presente en la información de restricciones
        return module.availabilityinfo != null || module.availability != null;
    }

    private evaluateCompletionActivityQuizzes(indicator: any, matchedContent: any): IndicatorResult {
        const sections = matchedContent.filter(section =>
            section && section.name.toLowerCase().includes('unidad')
        );

        // Filtrar los módulos de tipo "quiz" de todas las secciones
        const quizzes = sections.flatMap(section =>
            section.modules?.filter(module => module.modname === 'quiz') || []
        );

        // Validar cada cuestionario para verificar si cumple con los datos de finalización
        const invalidQuizzes = quizzes.filter(quiz => !this.hasCompletionDataQuiz(quiz));

        // Verificar si todos los cuestionarios cumplen con la configuración
        const allRestrictions = invalidQuizzes.length === 0;

        return {
            indicatorId: indicator.id,
            result: allRestrictions ? 1 : 0,
            observation: allRestrictions
                ? 'Todos los cuestionarios cumplen con la configuración de finalización de la actividad.'
                : `Los siguientes cuestionarios no cumplen con la configuración de finalización: ${invalidQuizzes.map(quiz => quiz.name).join(', ')}`,
        };
    }

    private hasCompletionDataQuiz(module: any): boolean {
        if (!module.completiondata) return false;

        const isAutomatic = module.completiondata.isautomatic;
        const isEndReached = module.completiondata.details?.some(
            detail => detail.rulename === 'completionpassgrade'
        );

        return isAutomatic && isEndReached;
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
            : `Retos inválidos (${invalidRetos.length}):\n${invalidRetos
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
                issues: this.getAvailabilityConfigIssues(reto),
            }));

        // Determinar si todos los retos cumplen
        const allValidAssigns = invalidRetos.length === 0;

        // Generar observaciones detalladas con los nombres de los retos que no cumplen
        const observation = allValidAssigns
            ? 'Todos los retos cumplen con la configuración de disponibilidad.'
            : `Retos inválidos (${invalidRetos.length}):\n${invalidRetos
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

        // Validar que la configuración exista y sea un arreglo
        if (!Array.isArray(configs)) return false;

        const findConfig = (plugin: string, subtype: string, name: string) =>
            configs.find(config => config.plugin === plugin && config.subtype === subtype && config.name === name);

        try {
            // Validaciones de configuración
            const fileSubmission = findConfig('file', 'assignsubmission', 'enabled');
            if (!fileSubmission || fileSubmission.value !== '1') return false;

            const maxFileSubmissions = findConfig('file', 'assignsubmission', 'maxfilesubmissions');
            if (!maxFileSubmissions || parseInt(maxFileSubmissions.value, 10) < 1) return false;

            const maxSubmissionSize = findConfig('file', 'assignsubmission', 'maxsubmissionsizebytes');
            const maxSubmissionLimit = config.maxsubmissionsizebytes * 1024 * 1024; // 500 MB en bytes
            if (!maxSubmissionSize || parseInt(maxSubmissionSize.value, 10) <= maxSubmissionLimit) return false;

            /*  const fileTypesList = findConfig('file', 'assignsubmission', 'filetypeslist');
            if (!fileTypesList || fileTypesList.value !== '') return false; */

            const feedbackComments = findConfig('comments', 'assignfeedback', 'enabled');
            if (!feedbackComments || feedbackComments.value !== '1') return false;

            const inlineComments = findConfig('comments', 'assignfeedback', 'commentinline');
            if (!inlineComments || inlineComments.value !== config.commentinline) return false;

            return true;
        } catch (error) {
            console.error(`Error al verificar el reto "${reto.name || 'Sin nombre'}":`, error);
            return false;
        }
    }

    private getAvailabilityConfigIssues(reto: any): string[] {
        const issues = [];
        const configs = reto.configs;

        if (!configs || !Array.isArray(configs)) {
            issues.push('Configuración ausente');
            return issues;
        }

        const findConfig = (plugin: string, subtype: string, name: string) =>
            configs.find(config => config.plugin === plugin && config.subtype === subtype && config.name === name);

        const fileSubmission = findConfig('file', 'assignsubmission', 'enabled');
        if (!fileSubmission || fileSubmission.value !== '1') issues.push('Tipos de entrega no configurados correctamente');

        const maxFileSubmissions = findConfig('file', 'assignsubmission', 'maxfilesubmissions');
        if (!maxFileSubmissions || parseInt(maxFileSubmissions.value, 10) < 1)
            issues.push('Número máximo de archivos incorrecto');

        const maxSubmissionSize = findConfig('file', 'assignsubmission', 'maxsubmissionsizebytes');
        const maxSubmissionLimit = 500 * 1024 * 1024; // 500 MB
        if (!maxSubmissionSize || parseInt(maxSubmissionSize.value, 10) !== maxSubmissionLimit)
            issues.push('Tamaño máximo de entrega incorrecto');

        /* const fileTypesList = findConfig('file', 'assignsubmission', 'filetypeslist');
        if (!fileTypesList || fileTypesList.value !== '') issues.push('Tipos de archivos aceptados configurados incorrectamente'); */

        const feedbackComments = findConfig('comments', 'assignfeedback', 'enabled');
        if (!feedbackComments || feedbackComments.value !== '1') issues.push('Retroalimentación no configurada correctamente');

        const inlineComments = findConfig('comments', 'assignfeedback', 'commentinline');
        if (!inlineComments || inlineComments.value !== '0') issues.push('Configuración de comentarios en línea incorrecta');

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
            .filter(content => !this.checkGeneralConfigForo(content, config))
            .map(content => {
                const issues = [];
                if (!content.name.toLowerCase().includes(config.name)) {
                    issues.push('nombre inválido');
                }
                if (!content.intro) {
                    issues.push('falta de instrucciones');
                }
                if (content.type !== config.type) {
                    issues.push(`tipo incorrecto (esperado: ${config.type})`);
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
                : `Foros inválidos (${invalidForos.length}):\n` +
                invalidForos.map(foro => `- ${foro.name}: ${foro.issues}`).join('\n'),
        };
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
            .filter(content => !this.checkAttachmentConfigForo(content, config))
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
                if (content.blockafter !== 0) {
                    issues.push('bloqueo después de publicaciones no está desactivado');
                }
                return { name: content.name || 'Sin nombre', issues: issues.join(', ') };
            });

        // Verificar si todos los foros cumplen
        const allValidAssigns = invalidForos.length === 0;

        return {
            indicatorId: indicator.id,
            result: allValidAssigns ? 1 : 0,
            observation: allValidAssigns
                ? 'Todos los foros cumplen con la configuración de adjuntos, recuento de palabras, suscripción y seguimiento.'
                : `Foros inválidos (${invalidForos.length}):\n` +
                invalidForos.map(foro => `- ${foro.name}: ${foro.issues}`).join('\n'),
        };
    }

    private checkAttachmentConfigForo(section: any, config: any): boolean {
        const isValidAttachment = section.maxattachments === config.maxfiles;
        const hasMaxbytes = section.maxbytes >= 0;
        const isForceSubscribe = section.forcesubscribe === 0;
        const isBlockAfter = section.blockafter === 0;
        return isValidAttachment && hasMaxbytes && isForceSubscribe && isBlockAfter;
    }

    private evaluateCompletionConfigForo(indicator: any, matchedContent: any): IndicatorResult {
        const invalidForos = matchedContent.filter(content => !this.checkCompletionForo(content));
        const allValidAssigns = invalidForos.length === 0;

        return {
            indicatorId: indicator.id,
            result: allValidAssigns ? 1 : 0,
            observation: allValidAssigns
                ? 'Todos los foros cumplen con la configuración de finalización'
                : `Foros inválidos: ${invalidForos.length}.\nNombre de foros inválidos: ${invalidForos.map(foro => foro.name).join(', ')}`
        };
    }

    private checkCompletionForo(section: any): boolean {
        return section.completionposts != 0;
    }

    /**
     * Funciones auxiliares para evaluar Videoconferencia Section
     * @param indicator 
     * @param matchedContent 
     * @returns 
     */
    private evaluateGeneralSectionVideo(indicator: any, matchedContent: any): IndicatorResult {
        const videoSection = matchedContent.find(section =>
            section.name.toLowerCase() === 'videoconferencias'
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
            section.name.toLowerCase() === 'videoconferencias'
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
            section.name.toLowerCase() !== 'videoconferencias'
        );
        const totalSubjects = uniqueSections.length;

        // Encontrar la sección "videoconferencias"
        const videoconferenciaSection = matchedResources.find(section =>
            section &&
            section.name &&
            section.name.toLowerCase() === 'videoconferencias'
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

        const hasUrlForeachSubject = totalSubjects === moduleBook.contents?.filter(item => item.filename != 'structure').length;

        return {
            indicatorId: indicator.id,
            result: hasUrlForeachSubject ? 1 : 0,
            observation: hasUrlForeachSubject
                ? 'Cumple con el indicador'
                : `No se cumple con el indicador: ${totalSubjects} unidades - Páginas: ${moduleBook.filter(item => item.filename != 'structure').length}`
        };
    }

    private evaluateRestrictionsBookVideo(indicator: any, matchedContent: any): IndicatorResult {
        const videoSection = matchedContent.find(section =>
            section.name.toLowerCase() === 'videoconferencias'
        );

        if (!videoSection) {
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'Sección de "Videoconferencias" no encontrada.',
            };
        }

        const moduleBook = videoSection.modules?.find(item => item.modname == 'book');
        const isAvailable = moduleBook.availability == null;

        return {
            indicatorId: indicator.id,
            result: isAvailable ? 1 : 0,
            observation: isAvailable ? 'Cumple con el indicador' : 'El libro tiene restricciones de acceso'
        };
    }

    private evaluateCompletionBookVideo(indicator: any, matchedContent: any): IndicatorResult {
        const videoSection = matchedContent.find(section =>
            section.name.toLowerCase() === 'videoconferencias'
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
        const isAutomatic = moduleBook.completiondata.isautomatic;
        const isAvailable = moduleBook.completiondata.details?.some(
            detail => detail.rulename === config.rulename
        );

        return {
            indicatorId: indicator.id,
            result: isAutomatic && isAvailable ? 1 : 0,
            observation: isAutomatic && isAvailable ? 'Cumple con el indicador' : 'El libro tiene restricciones de acceso'
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

        // Obtener las secciones únicas que no sean "videoconferencias"
        const uniqueSections = matchedResources.filter(section =>
            section &&
            typeof section === 'object' &&
            section.name &&
            section.name.toLowerCase() !== 'videoconferencias'
        );

        // Encontrar la sección "videoconferencias"
        const videoconferenciaSection = matchedResources.find(section =>
            section &&
            section.name &&
            section.name.toLowerCase() === 'videoconferencias'
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
                : `No cumplen con los datos de finalización: ${invalidModules.map(module => module.name).join(', ')}`
        };
    }

    private hasCompletionDataUrl(module: any): boolean {
        // Verifica si el módulo tiene datos de finalización válidos
        return module.completiondata?.details?.every(item =>
            item.rulename === "completionview" && item.isautomatic
        );
    }
}    
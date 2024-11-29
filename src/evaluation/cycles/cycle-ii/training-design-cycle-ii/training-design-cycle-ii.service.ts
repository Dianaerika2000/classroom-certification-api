import { Injectable } from '@nestjs/common';
import { MoodleService } from 'src/moodle/moodle.service';
import { JSDOM } from 'jsdom';
import { IndicatorResult } from 'src/evaluation/interfaces/indicator-result.interface';

@Injectable()
export class TrainingDesignCycleIiService {
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
        token?: string
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
        return contentEvaluator(indicators, matchedContent, token);
    }

    /**
    * Retorna la función evaluadora específica según el recurso
    */
    private getContentEvaluator(contentName: string): ((indicators: any[], matchedContent: any, token?: string) => IndicatorResult[]) | null {
        const resourceEvaluators = {
            'Mapa mental': this.evaluateMapaMental.bind(this),
            'Lección de contenidos': this.evaluateLeccionContenidos.bind(this),
            'Cuestionario de autoevaluación': this.evaluateCuestionariosAutoevaluacion.bind(this),
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
     * Función para evaluar los indicadores del recurso: Mapa mental
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateMapaMental(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = [];

        if (matchedContent) {
            const indicatorHandlers = {
                'objetivos': async (indicator: any) => {
                    return this.evaluateUnitObjectives(indicator, matchedContent);
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
     * Función para evaluar los indicadores del recurso: Lección de contenidos
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateLeccionContenidos(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = [];

        if (matchedContent) {
            const indicatorHandlers = {
                'preguntas': async (indicator: any) => {
                    return this.evaluateQuestionsInLessons(indicator, matchedContent, token);
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
     * Función para evaluar los indicadores del recurso: Cuestionario de autoevaluación
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateCuestionariosAutoevaluacion(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        return this.evaluateUnimplementedContent(indicators, matchedContent, "Cuestionario de autoevaluación");
    }

    /**
     * Función para evaluar los indicadores del recurso: Retos
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateRetos(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = [];

        if (matchedContent) {
            const indicatorHandlers = {
                'instrucciones': async (indicator: any) => {
                    return this.evaluateInstructionsForRetos(indicator, matchedContent);
                },
                'archivo adjunto': async (indicator: any) => {
                    return this.evaluateSupportFilesForRetos(indicator, matchedContent);
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
     * Función para evaluar los indicadores del recurso: Foros
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateForos(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = [];

        if (matchedContent) {
            const indicatorHandlers = {
                'Inicio': async (indicator: any) => {
                    return this.evaluateIntroSubjectForForums(indicator, matchedContent);
                },
                'instrucciones': async (indicator: any) => {
                    return this.evaluateInstructionsForForums(indicator, matchedContent);
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
     * Función para evaluar los indicadores del recurso: Videoconferencias
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateVideoconferencias(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = [];

        if (matchedContent) {
            const indicatorHandlers = {
                'mapa': async (indicator: any) => {
                    return this.hasMapaVideoconferencias(indicator, matchedContent);
                },
                'cantidad de enlaces': async (indicator: any) => {
                    return this.hasUrlForeachSubject(indicator, matchedContent);
                },
                'libro': async (indicator: any) => {
                    return this.hasRecordingBook(indicator, matchedContent);
                },
                'grabación': async (indicator: any) => {
                    return this.hasRecordingPerPage(indicator, matchedContent);
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
     * Funciones auxiliares para Mapa mental
     * @param indicator 
     * @param matchedResources 
     * @returns 
     */
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

    private evaluateUnitObjectives(indicator: any, sections: any[]): IndicatorResult {
        // Filtrar secciones que contienen "unidad" en su nombre
        const lessonSections = sections.filter(section =>
            section && section.name.toLowerCase().includes('unidad')
        );

        // Validar cada sección usando la función isValidUnitObjective
        const invalidSections = lessonSections.filter(section => !this.isValidUnitObjective(section));

        // Verificar si todas las secciones tienen objetivos válidos
        const allValid = invalidSections.length === 0;

        return {
            indicatorId: indicator.id,
            result: allValid ? 1 : 0,
            observation: allValid
                ? 'Todas las secciones tienen objetivos de la unidad válidos.'
                : `Las siguientes secciones no cumplen: \n${invalidSections.map(section => section.name).join(', \n')}`,
        };
    }

    /**
     * Funciones auxiliares para evaluar Retos
     * @param reto 
     * @returns 
     */
    private hasInstructionsReto(reto: any): boolean {
        const hasIntro = reto.intro && typeof reto.intro === 'string';
        const hasActivity = reto.activity && typeof reto.activity === 'string';

        // Busca palabras clave que indican instrucciones
        const keywords = ['realizar', 'elaborar', 'desarrollar', 'crear', 'hacer', 'completar', 'leer', 'subir', 'instrucciones', 'realice'];
        const hasInstructionKeywords = (text: string) =>
            keywords.some(keyword => text.toLowerCase().includes(keyword));

        return (hasIntro && hasInstructionKeywords(reto.intro)) || (hasActivity && hasInstructionKeywords(reto.activity));
    }

    private hasSupportFilesReto(reto: any): boolean {
        return (reto.introattachments && reto.introattachments.length > 0) ||
            (reto.activityattachments && reto.activityattachments.length > 0) ||
            (reto.introfiles && reto.introfiles.length > 0);
    }

    private evaluateInstructionsForRetos(indicator: any, retos: any[]): IndicatorResult {
        let totalRetos = retos.length;
        let successfulRetos = 0;

        const failedObservations: string[] = [];
        // Evalúa cada reto y registra resultados
        for (const reto of retos) {
            const hasInstructions = this.hasInstructionsReto(reto);

            if (hasInstructions) {
                successfulRetos++;
            } else {
                // Genera observaciones para los retos que no cumplen
                failedObservations.push(
                    `"${reto.name || 'sin título'}" no cumple con: ${!hasInstructions ? 'Instrucciones específicas' : ''}`.trim().replace(/,\s*$/, '') // Elimina la última coma
                );
            }
        }

        // Calcular resultado final basado en retos exitosos
        const result = successfulRetos === totalRetos ? 1 : 0;

        return {
            indicatorId: indicator.id,
            result,
            observation: result === 1
                ? 'Todos los retos cumplen con los criterios del indicador.'
                : `No todos los retos cumplen con los criterios. Retos fallidos: \n${failedObservations.join('; \n')}`
        };
    }

    private evaluateSupportFilesForRetos(indicator: any, retos: any[]): IndicatorResult {
        let totalRetos = retos.length;
        let successfulRetos = 0;

        const failedObservations: string[] = [];
        // Evalúa cada reto y registra resultados
        for (const reto of retos) {
            const hasSupportFiles = this.hasSupportFilesReto(reto);

            if (hasSupportFiles) {
                successfulRetos++;
            } else {
                // Genera observaciones para los retos que no cumplen
                failedObservations.push(
                    `"${reto.name || 'sin título'}" no cumple con: ${!hasSupportFiles ? 'Archivos de apoyo' : ''}`.trim().replace(/,\s*$/, '') // Elimina la última coma
                );
            }
        }

        // Calcular resultado final basado en retos exitosos
        const result = successfulRetos === totalRetos ? 1 : 0;

        return {
            indicatorId: indicator.id,
            result,
            observation: result === 1
                ? 'Todos los retos cumplen con los criterios del indicador.'
                : `No todos los retos cumplen con los criterios. Retos fallidos: \n${failedObservations.join('; \n')}`
        };
    }

    /**
     * Funciones auxiliares para evaluar Foros
     * @param reto 
     * @returns 
     */
    private hasInstructionsForum(forum: any): boolean {
        const hasIntro = forum.intro && forum.intro !== "";
        return hasIntro;
    }

    private hasIntroSubjectForum(forum: any): boolean {
        const hasIntroSubject = forum.numdiscussions && forum.numdiscussions > 0;
        return hasIntroSubject;
    }

    private evaluateInstructionsForForums(indicator: any, forums: any[]): IndicatorResult {
        let totalForums = forums.length;
        let successfulForums = 0;

        const failedObservations: string[] = [];
        // Evalúa cada reto y registra resultados
        for (const forum of forums) {
            const hasInstructions = this.hasInstructionsForum(forum);

            if (hasInstructions) {
                successfulForums++;
            } else {
                // Genera observaciones para los retos que no cumplen
                failedObservations.push(
                    `"${forum.name || 'sin título'}" no cumple con: ${!hasInstructions ? 'Instrucciones previas' : ''}`.trim().replace(/,\s*$/, '') // Elimina la última coma
                );
            }
        }

        // Calcular resultado final basado en retos exitosos
        const result = successfulForums === totalForums ? 1 : 0;

        return {
            indicatorId: indicator.id,
            result,
            observation: result === 1
                ? 'Todos los foros cumplen con los criterios del indicador.'
                : `No todos los foros cumplen con los criterios. Foros fallidos: \n${failedObservations.join('; \n')}`
        };
    }

    private evaluateIntroSubjectForForums(indicator: any, forums: any[]): IndicatorResult {
        let totalForums = forums.length;
        let successfulForums = 0;

        const failedObservations: string[] = [];
        // Evalúa cada reto y registra resultados
        for (const forum of forums) {
            const hasSubject = this.hasIntroSubjectForum(forum);

            if (hasSubject) {
                successfulForums++;
            } else {
                // Genera observaciones para los retos que no cumplen
                failedObservations.push(
                    `"${forum.name || 'sin título'}" no cumple con: ${!hasSubject ? 'Tema de Inicio' : ''}`.trim().replace(/,\s*$/, '') // Elimina la última coma
                );
            }
        }

        // Calcular resultado final basado en retos exitosos
        const result = successfulForums === totalForums ? 1 : 0;

        return {
            indicatorId: indicator.id,
            result,
            observation: result === 1
                ? 'Todos los foros cumplen con los criterios del indicador.'
                : `No todos los foros cumplen con los criterios. Foros fallidos: \n${failedObservations.join('; \n')}`
        };
    }

    /**
     * Funciones auxiliares para Videoconferencias
     * @param indicator 
     * @param matchedResources 
     * @returns 
     */
    private hasUrlForeachSubject(indicator: any, matchedResources: any[]): IndicatorResult {
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
        const validModules = videoconferenciaSection.modules.filter(
            module => module && module.modname && module.modname.toLowerCase() !== 'book'
        );

        const hasUrlForeachSubject = totalSubjects === validModules.length;

        return {
            indicatorId: indicator.id,
            result: hasUrlForeachSubject ? 1 : 0,
            observation: hasUrlForeachSubject
                ? 'Cumple con el indicador: cada unidad tiene una URL de videoconferencia'
                : `No se cumple con el indicador: ${totalSubjects} unidades y ${validModules.length} módulos de videoconferencia`
        };
    }

    private hasMapaVideoconferencias(indicator: any, matchedResources: any[]): IndicatorResult {
        const uniqueSections = matchedResources
            .flatMap(item => item.matchedSection) // Aplanar el array de matchedSection
            .filter(section =>
                section &&
                typeof section === 'object' &&
                section.name.toLowerCase() === 'videoconferencias'
            )
            // Eliminar duplicados basados en el id de la sección
            .filter((section, index, self) =>
                index === self.findIndex((t) =>
                    t.id === section.id
                )
            );

        const hasMapa = uniqueSections.every((section) => {
            if (!section.summary || typeof section.summary !== 'string') {
                return false;
            }

            const summaryLower = section.summary.toLowerCase();
            return summaryLower.includes('img') ||
                summaryLower.includes('<img src=');
        });

        return {
            indicatorId: indicator.id,
            result: hasMapa ? 1 : 0,
            observation: hasMapa ? 'Cumple con el indicador' : 'No se cumple con el indicador'
        };
    }

    private hasRecordingBook(indicator: any, matchedResources: any[]): IndicatorResult {
        // Encontrar la sección "videoconferencias"
        const videoconferenciaSection = matchedResources.find(section =>
            section && section.name.toLowerCase() === 'videoconferencias' || section.name.toLowerCase() === 'videoconferencia'
        );

        if (!videoconferenciaSection || !videoconferenciaSection.modules) {
            // Si no existe la sección o no tiene módulos, no cumple
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'No se encontró la sección de videoconferencias o no tiene módulos'
            };
        }

        // Obtener módulo de grabaciones modname: "book"
        const moduleTypeBook = videoconferenciaSection.modules.filter(
            module => module.modname.toLowerCase() === 'book'
        );

        if (!moduleTypeBook || !Array.isArray(moduleTypeBook) || moduleTypeBook.length === 0) {
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'No se encontraron módulos tipo libro en la sección de videoconferencias'
            };
        }

        const keywords = ['grabaciones', 'grabadas', 'guardadas'];
        const isValidName = keywords.some(keyword => moduleTypeBook[0].name.toLowerCase().includes(keyword));

        return {
            indicatorId: indicator.id,
            result: isValidName ? 1 : 0,
            observation: isValidName
                ? 'Cumple con el indicador: Libro con nombre Grabaciones de videoconferencia'
                : `No se cumple con el indicador: Nombre del libro - ${moduleTypeBook[0].name}`
        };
    }

    private hasRecordingPerPage(indicator: any, matchedResources: any[]): IndicatorResult {
        // Verificar que matchedResources existe y es un array
        if (!matchedResources || !Array.isArray(matchedResources)) {
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'No hay recursos para evaluar'
            };
        }

        // Obtener las secciones únicas que no sean "videoconferencias"
        const uniqueSections = matchedResources.filter(section =>
            section && typeof section === 'object' && section.name && section.name.toLowerCase() !== 'videoconferencias' || section.name.toLowerCase() !== 'videoconferencia');

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

        // Obtener módulos de tipo book
        const moduleTypeBook = videoconferenciaSection.modules.find(
            module => module && module.modname && module.modname.toLowerCase() === 'book'
        );

        if (!moduleTypeBook || !moduleTypeBook.contents) {
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'No se encontró el módulo de tipo Libro o no tiene contenidos'
            };
        }

        // Calcular total de capítulos, excluyendo 'structure'
        const totalChapters = moduleTypeBook.contents.filter(content => content && content.filename !== 'structure').length;

        return {
            indicatorId: indicator.id,
            result: totalSubjects === totalChapters ? 1 : 0,
            observation: totalSubjects === totalChapters
                ? 'Cumple con el indicador'
                : `No se cumple con el indicador: ${moduleTypeBook.name || 'Sin nombre'} - Total de páginas: ${totalChapters}`
        };
    }

    /**
     * Funciones auxiliares para Lecciones
     * @param indicator 
     * @param matchedResources 
     * @returns 
     */
    private async hasQuestionInLessonContent(lesson: any, token: string): Promise<boolean> {
        // Obtener las páginas de la lección
        const pagesInLesson = await this.moodleService.getLessonPages(lesson.instance, token);

        if (pagesInLesson) {
            // Filtrar las páginas que son de tipo "Contenido"
            const questionPages = pagesInLesson.filter(page => page.typestring !== 'Contenido');

            return questionPages.length >= 4;
        }
        return false;
    }

    private async hasQuestionInLessons(lessons: any[], token: string): Promise<boolean> {
        // Usamos Promise.all para ejecutar las validaciones de cada lección de manera paralela
        const results = await Promise.all(lessons.map(async (lesson) => {
            // Llamamos a la función hasQuestionInLessonContent para cada lección
            return this.hasQuestionInLessonContent(lesson, token);
        }));

        // Verificamos si al menos 4 lecciones contienen preguntas
        const lessonsWithQuestions = results.filter(result => result === true).length;
        return lessonsWithQuestions >= 4;
    }

    private async evaluateQuestionsInLessons(indicator: any, sections: any[], token: string): Promise<IndicatorResult> {
        // Filtrar las secciones que contienen la palabra "unidad"
        const lessonSections = sections.filter(section =>
            section && section.name.toLowerCase().includes('unidad')
        );

        // Obtener los módulos de tipo "lesson" de las secciones filtradas
        const lessons = lessonSections.flatMap(section =>
            section.modules.filter(module => module.modname === 'lesson')
        );

        // Verificar si al menos 4 lecciones tienen preguntas utilizando la función hasQuestionInLessons
        const hasQuestions = await this.hasQuestionInLessons(lessons, token);

        // Crear y devolver el IndicatorResult
        return {
            indicatorId: indicator.id,
            result: hasQuestions ? 1 : 0,
            observation: hasQuestions
                ? 'Cumple con el indicador: Al menos 4 lecciones tienen preguntas'
                : 'No cumple con el indicador: Menos de 4 lecciones tienen preguntas'
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

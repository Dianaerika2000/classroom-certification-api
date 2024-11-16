import { Injectable } from '@nestjs/common';
import { Indicator } from 'src/indicator/entities/indicator.entity';
import { MoodleService } from 'src/moodle/moodle.service';

interface IndicatorResult {
    indicatorId: number;
    result: number;
    observation?: string;
}

@Injectable()
export class TrainingDesignService {
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
                observation: `El contenido ${content.name} requiere verificación manual`
            }));
        }

        // Evalúa los indicadores usando el evaluador específico
        return token != null ? contentEvaluator(indicators, matchedContent, token) : contentEvaluator(indicators, matchedContent, token);
    }

    /**
   * Retorna la función evaluadora específica según el recurso
   */
    private getContentEvaluator(contentName: string): ((indicators: any[], matchedContent: any, token?: string) => IndicatorResult[]) | null {
        const resourceEvaluators = {
            'Etiqueta': this.evaluateLabelResource.bind(this),
            'Datos de la asignatura': this.evaluateSubjectDataContent.bind(this),
            'Contenido de la asignatura y referencias bibliográficas': this.evaluateContent.bind(this),
            'Carta descriptiva': this.evaluateSubjectDataContent.bind(this),
            'Guía de aprendizaje': this.evaluateLearningGuide.bind(this),
            'Sistema de evaluación': this.evaluateEvaluationSystem.bind(this),
            'Curriculum vitae del autor del contenido del aula': this.evaluateCurriculum.bind(this),
            'Video de presentación de la materia': this.evaluateVideoPresentation.bind(this)
        };

        // Busca coincidencia exacta o parcial
        const evaluator = Object.entries(resourceEvaluators).find(([key]) =>
            contentName.toLowerCase().includes(key.toLowerCase())
        );

        return evaluator ? evaluator[1] : null;
    }

    /**
     * Función para evaluar los indicadores del recurso: Etiqueta
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluateLabelResource(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        return this.evaluateUnimplementedContent(indicators, matchedContent, "Etiqueta");
    }

    /**
     * Función para evaluar los indicadores del contenido: Datos de la asignatura
     * @param indicators 
     * @param matchedContent 
     * @param token 
     * @returns 
     */
    private async evaluateSubjectDataContent(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const content = this.findContentByName(matchedContent.contents, 'Datos de la asignatura');

            if (content) {
                const indicatorHandlers = {
                    'prerequisitos': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
                    },
                    'sigla, código y semestre': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
                    },
                    'horas semanales y créditos': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
                    },
                    'fecha de revisión': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
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
                            observation: 'Este indicador requiere verificación manual del formato del contenido',
                        });
                    }
                }
            }
        }

        return results; // Devuelve un array de resultados
    }

    /**
     * Función para evaluar los indicadores del contenido: Contenido de la asignatura
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluateContent(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const content = this.findContentByName(matchedContent.contents, 'Contenido de la asignatura');

            if (content) {
                const indicatorHandlers = {
                    'referencia bibliográfica': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
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
                            observation: 'Este indicador requiere verificación manual del formato del contenido',
                        });
                    }
                }
            }
        }

        return results; // Devuelve un array de resultados
    }

    /**
     * Función para evaluar los indicadores del recurso: Guía de aprendizaje
     * @param indicators 
     * @param matchedContent 
     * @returns 
     */
    private async evaluateLearningGuide(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        let results: IndicatorResult[] = []; // Cambiado a let para permitir reasignación

        if (matchedContent != null) {
            const content = this.findContentByName(matchedContent.contents, 'Guía de aprendizaje');

            if (content) {
                // Obtener el contenido del capítulo desde Moodle
                const htmlcontent = await this.moodleService.getBookChapterContent(token, content.fileurl);

                if (htmlcontent) {
                    // Llamar a evaluateLearningGuideHml para procesar los resultados
                    results = this.evaluateLearningGuideHml(indicators, htmlcontent);
                    return results; // Retorna los resultados inmediatamente
                }
            }
        }

        // Si no hay contenido o resultados, devuelve observaciones por defecto
        return indicators.map(indicator => ({
            indicatorId: indicator.id,
            result: 0,
            observation: `Indicador "${indicator.name}" requiere implementación específica para guía de aprendizaje`
        }));
    }

    /**
     * Función para evaluar los indicadores del contenido: Sistema de evaluación
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluateEvaluationSystem(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        if (matchedContent) {
            const content = this.findContentByName(matchedContent.contents, 'Evaluaciones');
            if (content) {
                const htmlContent = await this.moodleService.getBookChapterContent(token, content.fileurl);
                if (htmlContent) {
                    return this.evaluateEvaluationContent(indicators, htmlContent);
                }
            }
        }
        return indicators.map(indicator => ({
            indicatorId: indicator.id,
            result: 0,
            observation: 'No se encontró contenido evaluable para "Evaluaciones"'
        }));
    }

    /**
     * Función para evaluar los indicadores del contenido: Curriculum vitae
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluateCurriculum(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        return this.evaluateUnimplementedContent(indicators, matchedContent, "Curriculum vitae");
    }

    /**
     * Función para evaluar los indicadores del recurso: Video presentación
     * @param indicators 
     * @param matchedContent 
     * @returns 
     */
    private async evaluateVideoPresentation(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        return this.evaluateUnimplementedContent(indicators, matchedContent, "Video presentación");
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
            observation: `Indicador "${indicator.name}" requiere implementación específica para ${contentName}`
        }));
    }

    // Función para obtener el contenido desde Moodle
    private async fetchContentFromMoodle(fileurl: string, token: string, indicator: any): Promise<IndicatorResult> {
        try {
            // Obtener el contenido del capítulo desde Moodle
            const htmlcontent = await this.moodleService.getBookChapterContent(token, fileurl);

            if (htmlcontent != null) {
                // Validar el contenido HTML con respecto al indicador
                const isValid = await this.validateContentHtml(htmlcontent, indicator.name);

                // Devolver el indicador evaluado basado en si es válido o no
                return {
                    indicatorId: indicator.id,
                    result: isValid ? 1 : 0,
                    observation: isValid ? 'Cumple con el indicador' : 'No se cumple con el indicador'
                };
            }
        } catch (error) {
            console.error(`Error al obtener el contenido de Moodle para el indicador: ${indicator.name}`, error);
        }

        // Devolver un resultado por defecto en caso de error o falta de contenido
        return {
            indicatorId: indicator.id,
            result: 0,
            observation: 'Error al obtener o procesar el contenido de Moodle'
        };
    }

    private async validateContentHtml(htmlContent: string, indicatorName: string): Promise<boolean> {
        // Definir palabras clave que se deben buscar en el HTML
        const requiredKeywords = {
            'prerequisitos': ['pre-requisitos', 'requisitos'],
            'sigla, código y semestre': ['sigla', 'código', 'semestre'],
            'horas semanales': ['horas semanales', 'horarios'],
            'créditos': ['créditos'],
            'fecha de revisión': ['revisado en', 'fecha de revisión'],
            'referencia bibliográfica': ['referencia bibliográfica', 'bibliografía'],
        };

        // Normalizar nombres e indicadores para comparación
        const normalizedIndicatorName = indicatorName.toLowerCase().trim();
        const keywords = requiredKeywords[normalizedIndicatorName];

        if (!keywords) {
            console.log(`No se encontró una palabra clave para el indicador: ${indicatorName}`);
            return false;
        }

        // Normalizar contenido HTML para evitar fallos por mayúsculas/minúsculas
        const normalizedHtmlContent = htmlContent.toLowerCase();

        // Verificar presencia de palabras clave
        if (Array.isArray(keywords)) {
            // Todas las palabras clave deben estar presentes
            return keywords.every(keyword => normalizedHtmlContent.includes(keyword));
        } else {
            // Verificar presencia de una sola palabra clave
            return normalizedHtmlContent.includes(keywords);
        }
    }

    private evaluateLearningGuideHml(indicators: Indicator[], htmlContent: any): IndicatorResult[] {
        if (!htmlContent) {
            return indicators.map(indicator => ({
                indicatorId: indicator.id,
                result: 0,
                observation: 'El contenido no contiene datos para evaluar'
            }));
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        const results: IndicatorResult[] = [];

        // Evaluación de prerequisitos
        const prerequisitesSection = doc.querySelector("th:contains('INICIO')");
        const hasPrerequisites = prerequisitesSection && Array.from(prerequisitesSection.parentNode.querySelectorAll("th, td"))
            .some(activity => /lectura|cuestionario diagnóstico/i.test(activity.textContent));

        results.push({
            indicatorId: indicators.find(i => i.name.includes('prerequisitos'))?.id || 0,
            result: hasPrerequisites ? 1 : 0,
            observation: hasPrerequisites ? 'Cumple con los prerequisitos' : 'No se describen los prerequisitos'
        });

        // Evaluación del desarrollo de unidades temáticas
        const unitSection = doc.querySelector("td:contains('AVANCE DE UNIDADES TEMÁTICAS')");
        const hasUnitDevelopment = unitSection && Array.from(unitSection.parentNode.querySelectorAll("th, td"))
            .some(activity => /lecciones|mapa mental interactivo|autoevaluación/i.test(activity.textContent));

        results.push({
            indicatorId: indicators.find(i => i.name.includes('desarrollo de unidades'))?.id || 0,
            result: hasUnitDevelopment ? 1 : 0,
            observation: hasUnitDevelopment ? 'Describe el desarrollo de unidades temáticas' : 'No se describe el desarrollo de unidades temáticas'
        });

        // Evaluación de actividades de reto
        const challengeActivities = doc.querySelectorAll("td a[href*='assign/view.php']");
        const hasChallenges = challengeActivities.length > 0;

        results.push({
            indicatorId: indicators.find(i => i.name.includes('actividades de reto'))?.id || 0,
            result: hasChallenges ? 1 : 0,
            observation: hasChallenges ? 'Se describen actividades de reto' : 'No se describen actividades de reto'
        });

        // Evaluación de comunicación: foros y videoconferencias
        const communicationSection = doc.querySelector("td:contains('Foros de debate')");
        const forumMatch = communicationSection && /foros? de debate/i.test(communicationSection.textContent);
        const videoMatch = communicationSection && communicationSection.textContent.match(/videoconferencias?:?\s*(\d+)/i);
        const numberOfVideoconferences = videoMatch ? parseInt(videoMatch[1], 10) : 0;

        results.push({
            indicatorId: indicators.find(i => i.name.includes('foros y videoconferencias'))?.id || 0,
            result: forumMatch && numberOfVideoconferences > 0 ? 1 : 0,
            observation: forumMatch && numberOfVideoconferences > 0
                ? `Se describen foros y ${numberOfVideoconferences} videoconferencias`
                : 'No se describen los foros o las videoconferencias'
        });

        // Evaluación de actividades de evaluación
        const evaluationSection = doc.querySelector("th:contains('CIERRE')");
        const evaluationActivities = evaluationSection
            ? Array.from(evaluationSection.parentNode.querySelectorAll("th, td"))
            : [];
        const evaluationResults = evaluationActivities.filter(activity =>
            /(Primer parcial|Segundo parcial|Examen Final|Proyecto Final|Tareas):?\s*(\d+)%/i.test(activity.textContent)
        );

        results.push({
            indicatorId: indicators.find(i => i.name.includes('actividades de evaluación'))?.id || 0,
            result: evaluationResults.length > 0 ? 1 : 0,
            observation: evaluationResults.length > 0
                ? `Se describen actividades de evaluación con porcentajes`
                : 'No se describen las actividades de evaluación con porcentajes'
        });

        return results;
    }

    private evaluateEvaluationContent(indicators: any[], htmlContent: string): IndicatorResult[] {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const results: IndicatorResult[] = [];

        // Indicador: Normas de evaluación
        const normasSection = doc.querySelector("th:contains('Normas de evaluación')");
        const hasNormas = normasSection && normasSection.nextElementSibling?.textContent.includes('restricción de acceso');
        results.push({
            indicatorId: indicators.find(i => i.name.includes('Normas de evaluación'))?.id || 0,
            result: hasNormas ? 1 : 0,
            observation: hasNormas ? 'Se describen normas de evaluación' : 'No se describen normas de evaluación'
        });

        // Indicador: Formas e instrumentos de evaluación
        const formasSection = doc.querySelector("th:contains('Formas e instrumentos de evaluación')");
        const hasFormas = formasSection && formasSection.nextElementSibling?.textContent.includes('evaluación diagnóstica');
        results.push({
            indicatorId: indicators.find(i => i.name.includes('formas de evaluación'))?.id || 0,
            result: hasFormas ? 1 : 0,
            observation: hasFormas ? 'Se describen formas e instrumentos de evaluación' : 'No se describen formas e instrumentos de evaluación'
        });

        // Indicador: Actividades y ponderaciones
        const activitiesTable = doc.querySelectorAll("table")[1]; // Segunda tabla con actividades y ponderaciones
        const rows = activitiesTable ? activitiesTable.querySelectorAll("tr") : [];
        const hasValidActivities = Array.from(rows).some(row => {
            const cells = row.querySelectorAll("td");
            return cells.length === 3 && cells[2].textContent.trim().endsWith('%');
        });
        results.push({
            indicatorId: indicators.find(i => i.name.includes('Actividades'))?.id || 0,
            result: hasValidActivities ? 1 : 0,
            observation: hasValidActivities
                ? 'Se describen actividades y sus ponderaciones'
                : 'No se describen actividades o sus ponderaciones'
        });

        // Indicador: Total de ponderaciones es 100%
        const totalRow = Array.from(rows).find(row => row.textContent.includes('Total'));
        const totalPonderacion = totalRow
            ? totalRow.querySelector("td:last-child")?.textContent.replace('%', '').trim()
            : null;
        const isValidTotal = totalPonderacion === '100';
        results.push({
            indicatorId: indicators.find(i => i.name.includes('porcentajes'))?.id || 0,
            result: isValidTotal ? 1 : 0,
            observation: isValidTotal
                ? 'El total de las ponderaciones suma 100%'
                : 'El total de las ponderaciones no suma 100%'
        });

        return results;
    }

    private findContentByName(contents: any[], name: string) {
        return contents.find(content => content.content === name);
    }
}

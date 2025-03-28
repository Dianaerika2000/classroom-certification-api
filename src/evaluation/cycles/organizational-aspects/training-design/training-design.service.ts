import { Injectable } from '@nestjs/common';
import { Indicator } from 'src/indicator/entities/indicator.entity';
import { MoodleService } from 'src/moodle/moodle.service';
import { JSDOM } from 'jsdom';
import { IndicatorResult } from 'src/evaluation/interfaces/indicator-result.interface';

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
                observation: `El recurso/contenido "${content.name}" no pudo ser encontrado. Por favor, revise manualmente.`
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
            'Etiqueta': this.evaluateLabelResource.bind(this),
            'Datos de la asignatura': this.evaluateSubjectDataContent.bind(this),
            'Contenido de la asignatura y referencias bibliográficas': this.evaluateContent.bind(this),
            'Carta descriptiva': this.evaluateDescriptiveLetter.bind(this),
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
            const content = this.findContentByName(matchedContent.contents, 'Datos generales de la asignatura');

            if (content) {
                const indicatorHandlers = {
                    'datos están organizados': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
                    },
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
                            observation: `El indicador "${indicator.name}" requiere verificación manual`,
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
            const content = this.findContentByName(matchedContent.contents, 'Contenido de la Asignatura');

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
                            observation: `El indicador "${indicator.name}" requiere verificación manual`,
                        });
                    }
                }
            }
        }

        return results; // Devuelve un array de resultados
    }

    /**
     * Función para evaluar los indicadores del contenido: Carta Descriptiva
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluateDescriptiveLetter(indicators: any[], matchedContent: any, token: string): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const content = this.findContentByName(matchedContent.contents, 'Carta Descriptiva');

            if (content) {
                const indicatorHandlers = {
                    'retos': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
                    },
                    'parciales': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
                    },
                    'videoconferencia': async (indicator: any) => {
                        return await this.fetchContentFromMoodle(content.fileurl, token, indicator);
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
                    results = this.evaluateLearningGuideHtml(indicators, htmlcontent);
                    return results; // Retorna los resultados inmediatamente
                }
            }
        }

        // Si no hay contenido o resultados, devuelve observaciones por defecto
        return indicators.map(indicator => ({
            indicatorId: indicator.id,
            result: 0,
            observation: `No cumple. El recurso/contenido "Guía de aprendizaje" no pudo ser encontrado.`
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
            const content = this.findContentByName(matchedContent.contents, 'Sistema de Evaluación');
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
            observation: 'No cumple. No se encontró contenido "Sistema de Evaluación".'
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
            observation: `El indicador "${indicator.name}" requiere revisión manual.`
        }));
    }

    // Función para obtener el contenido desde Moodle
    private async fetchContentFromMoodle(fileurl: string, token: string, indicator: any): Promise<IndicatorResult> {
        try {
            // Obtener el contenido del capítulo desde Moodle
            const htmlcontent = await this.moodleService.getBookChapterContent(token, fileurl);

            if (htmlcontent != null) {
                // Validar el contenido HTML con respecto al indicador
                const isValid = this.validateIndicator(htmlcontent, indicator.name);

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

    private validateIndicator(htmlContent: string, indicatorName: string): boolean {
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        // Normalizar el indicador a minúsculas para hacerlo más flexible
        const normalizedIndicatorName = indicatorName.toLowerCase()
            .trim()
            .replace(/[^a-záéíóúüñ\s]/gi, '');

        switch (normalizedIndicatorName) {
            case 'contiene prerequisitos de la materia':
                return this.validatePrerequisites(document);
            case 'contiene sigla código y semestre de la materia':
                return this.validateSiglaCodigoSemestre(document);
            case 'contiene horas semanales y créditos':
                return this.validateHorasCreditos(document);
            case 'contiene fecha de revisión del programa vigente':
                return this.validateFechaRevision(document);
            case 'cuenta con referencia bibliográfica':
                return this.validateReferenciaBibliografica(document);
            case 'contiene retos actividades prácticas a calificar según avance de la materia':
                return this.validateRetos(document);
            case 'contiene evaluación sumativa parciales y final de la materia':
                return this.validateEvaluacionSumativa(document);
            case 'indica enlaces de videoconferencia para reemplazar':
                return this.validateVideoconferencia(document);
            case 'los datos están organizados de acuerdo al formato mostrado en el manual':
                    return this.validatePrerequisites(document);
            default:
                console.info('Indicador no reconocido:', indicatorName);
                return false;
        }
    }

    private validatePrerequisites(document: Document): boolean {
        const prerequisitesRow = this.findRowByHeader(document, ['pre-requisitos', 'prerequisitos']);
        if (!prerequisitesRow) {
            console.info('No se encontró la fila de prerequisitos');
            return false;
        }

        const content = prerequisitesRow.querySelector('td')?.textContent?.trim();
        if (!content) {
            console.info('No se encontró contenido en prerequisitos');
            return false;
        }

        return true;
    }

    private validateSiglaCodigoSemestre(document: Document): boolean {
        const siglaRow = this.findRowByHeader(document, ['sigla y código']);
        const semestreRow = this.findRowByHeader(document, ['semestre']);

        if (!siglaRow || !semestreRow) {
            console.info('No se encontró sigla/código o semestre');
            return false;
        }

        const siglaContent = siglaRow.querySelector('td')?.textContent?.trim();
        const semestreContent = semestreRow.querySelector('td')?.textContent?.trim();

        if (!siglaContent || !semestreContent) {
            console.info('Falta contenido en sigla/código o semestre');
            return false;
        }

        return true;
    }

    private validateHorasCreditos(document: Document): boolean {
        const horasRow = this.findRowByHeader(document, ['horas semanales']);
        const creditosRow = this.findRowByHeader(document, ['créditos', 'creditos']);

        if (!horasRow || !creditosRow) {
            console.info('No se encontró horas semanales o créditos');
            return false;
        }

        const horasContent = horasRow.querySelector('td')?.textContent?.trim();
        const creditosContent = creditosRow.querySelector('td')?.textContent?.trim();

        if (!horasContent || !creditosContent) {
            console.info('Falta contenido en horas semanales o créditos');
            return false;
        }

        return true;
    }

    private validateFechaRevision(document: Document): boolean {
        const revisionRow = this.findRowByHeader(document, ['revisado en', 'fecha de revisión']);
        if (!revisionRow) {
            console.info('No se encontró la fecha de revisión');
            return false;
        }

        const content = revisionRow.querySelector('td')?.textContent?.trim();
        if (!content) {
            console.info('No se encontró contenido en fecha de revisión');
            return false;
        }

        return true;
    }

    private validateReferenciaBibliografica(document: Document): boolean {
        const revisionRow = this.findRowByHeader(document, ['referencia bibliográfica', 'bibliografía', 'fuentes', 'Referencia Bibliográfica']);
        if (!revisionRow) {
            console.info('No se encontró la referencia bibliográfica');
            return false;
        }

        const content = revisionRow.querySelector('th')?.textContent?.trim();
        if (!content) {
            console.info('No se encontró contenido en referencia bibliográfica');
            return false;
        }

        return true;
    }

    private validateRetos(document: Document): boolean {
        const revisionRow = this.findRowByHeader(document, ['Reto', 'reto', 'práctico', 'Práctico']);
        if (!revisionRow) {
            console.info('No se encontraron los retos');
            return false;
        }

        const content = revisionRow.querySelector('td')?.textContent?.trim();
        if (!content) {
            console.info('No se encontró contenido en Retos');
            return false;
        }

        return true;
    }

    private validateEvaluacionSumativa(document: Document): boolean {
        const revisionRow = this.findRowByHeader(document, ['parcial', 'examen final', 'examen parcial']);
        if (!revisionRow) {
            console.info('No se encontraron las evaluaciones');
            return false;
        }

        const content = revisionRow.querySelector('th')?.textContent?.trim();
        if (!content) {
            console.info('No se encontró contenido en parciales');
            return false;
        }

        return true;
    }

    private validateVideoconferencia(document: Document): boolean {
        const revisionRow = this.findRowByHeader(document, ['videoconferencia']);
        if (!revisionRow) {
            console.info('No se encontraron las videoconferencias');
            return false;
        }

        const content = revisionRow.querySelector('td')?.textContent?.trim();
        if (!content) {
            console.info('No se encontró contenido en videoconferencia');
            return false;
        }

        return true;
    }

    private findRowByHeader(document: Document, headerTexts: string[]): Element | null {
        const rows = document.querySelectorAll('tr');
    
        for (const row of Array.from(rows)) {
            const cells = row.querySelectorAll('th, td'); // Buscar tanto en <th> como en <td>
            for (const cell of Array.from(cells)) {
                const cellText = cell.textContent?.toLowerCase().trim() || '';
                if (headerTexts.some(text => cellText.includes(text.toLowerCase()))) {
                    return row; // Retornar la fila si encuentra coincidencia
                }
            }
        }
    
        return null; // No encontró coincidencia
    }    

    private evaluateLearningGuideHtml(indicators: Indicator[], htmlContent: string): IndicatorResult[] {
        if (!htmlContent) {
            return indicators.map(indicator => ({
                indicatorId: indicator.id,
                result: 0,
                observation: 'El contenido no contiene datos para evaluar'
            }));
        }

        // Crear un documento DOM usando jsdom
        const dom = new JSDOM(htmlContent);
        const doc = dom.window.document;

        const results: IndicatorResult[] = [];

        // Función auxiliar para buscar texto en elementos
        const findElementByText = (selector: string, text: string): HTMLElement | null => {
            const elements = Array.from(doc.querySelectorAll(selector)) as HTMLElement[];
            return elements.find(el => el.textContent?.toLowerCase().includes(text.toLowerCase())) || null;
        };

        // Evaluación de prerequisitos
        const prerequisitesSection = findElementByText("th", "INICIO");
        const prerequisitesRow = prerequisitesSection?.closest('tr') as HTMLTableRowElement;
        const hasPrerequisites = prerequisitesRow &&
            Array.from(prerequisitesRow.querySelectorAll("th, td"))
                .some(activity => /lectura|cuestionario diagnóstico/i.test(activity.textContent || ''));

        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('prerequisitos'))?.id || 0,
            result: hasPrerequisites ? 1 : 0,
            observation: hasPrerequisites ? 'Cumple con los prerequisitos' : 'No se describen los prerequisitos'
        });

        // Evaluación del desarrollo de unidades temáticas
        const unitSection = findElementByText("td", "AVANCE DE UNIDADES TEMÁTICAS");
        const unitRow = unitSection?.closest('tr') as HTMLTableRowElement;
        const hasUnitDevelopment = unitRow &&
            Array.from(unitRow.querySelectorAll("th, td"))
                .some(activity => /lecciones|mapa mental interactivo|autoevaluación/i.test(activity.textContent || ''));

        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('desarrollo de unidades'))?.id || 0,
            result: hasUnitDevelopment ? 1 : 0,
            observation: hasUnitDevelopment ? 'Describe el desarrollo de unidades temáticas' : 'No se describe el desarrollo de unidades temáticas'
        });

        // Evaluación de actividades de reto
        const challengeActivities = doc.querySelectorAll("td a[href*='assign/view.php']");
        const hasChallenges = challengeActivities.length > 0;

        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('actividades de reto'))?.id || 0,
            result: hasChallenges ? 1 : 0,
            observation: hasChallenges ? 'Se describen actividades de reto' : 'No se describen actividades de reto'
        });

        // Evaluación de comunicación: foros y videoconferencias
        const communicationSection = findElementByText("td", "Foros de debate");
        const forumMatch = communicationSection && /foros? de debate/i.test(communicationSection.textContent || '');
        const videoMatch = communicationSection?.textContent?.match(/videoconferencias?:?\s*(\d+)/i);
        const numberOfVideoconferences = videoMatch ? parseInt(videoMatch[1], 10) : 0;

        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('foros y videoconferencias'))?.id || 0,
            result: forumMatch && numberOfVideoconferences > 0 ? 1 : 0,
            observation: forumMatch && numberOfVideoconferences > 0
                ? `Se describen foros y ${numberOfVideoconferences} videoconferencias`
                : 'No se describen los foros o las videoconferencias'
        });

        // Evaluación de actividades de evaluación
        const evaluationSection = findElementByText("th", "CIERRE");
        const tableElement = evaluationSection.closest('tbody');
        const allEvaluationText = tableElement.textContent || '';

        // Crear un array para almacenar los porcentajes encontrados
        const evaluationComponents: { name: string; percentage: number }[] = [];

        // Buscar cada componente de evaluación
        const patterns = [
            /Primer parcial:\s*(\d+)%/i,
            /Segundo parcial:\s*(\d+)%/i,
            /Examen Final:\s*(\d+)%/i,
            /Proyecto Final:\s*(\d+)%/i,
            /Tareas:\s*(\d+)%/i
        ];

        patterns.forEach(pattern => {
            const match = allEvaluationText.match(pattern);
            if (match) {
                const percentage = parseInt(match[1], 10);
                evaluationComponents.push({
                    name: match[0].split(':')[0].trim(),
                    percentage
                });
            }
        });

        // Verificar si se encontraron componentes de evaluación
        const hasEvaluationComponents = evaluationComponents.length > 0;

        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('actividades de evaluación'))?.id || 0,
            result: hasEvaluationComponents ? 1 : 0,
            observation: hasEvaluationComponents
                ? `Se describen actividades de evaluación: ${evaluationComponents.map(comp => `${comp.name} (${comp.percentage}%)`).join(', ')}`
                : 'No se describen las actividades de evaluación con porcentajes'
        });

        return results;
    }

    private evaluateEvaluationContent(indicators: any[], htmlContent: string): IndicatorResult[] {
        // Crear un documento DOM usando jsdom
        const dom = new JSDOM(htmlContent);
        const doc = dom.window.document;
        const results: IndicatorResult[] = [];
    
        // Función auxiliar para buscar elementos por texto
        const findElementByText = (selector: string, text: string): HTMLElement | null => {
            const elements = Array.from(doc.querySelectorAll(selector)) as HTMLElement[];
            return elements.find(el => el.textContent?.toLowerCase().trim() === text.toLowerCase().trim()) || null;
        };
    
        // Indicador: Normas de evaluación
        const normasSection = findElementByText("th", "Normas de evaluación");
        const normasContent = normasSection?.closest('tr')?.nextElementSibling as HTMLElement | null;
        const hasNormas = normasContent && normasContent.textContent?.trim() !== '';

        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('normas de evaluación'))?.id || 0,
            result: hasNormas ? 1 : 0,
            observation: hasNormas
                ? 'Se describen normas de evaluación'
                : 'No se describen normas de evaluación'
        });
    
        // Indicador: Formas e instrumentos de evaluación
        const formasSection = findElementByText("th", "Formas e instrumentos de evaluación");
        const formasContent = formasSection?.closest('tr')?.nextElementSibling as HTMLElement | null;
        const hasFormas = formasContent && formasContent.textContent?.trim() !== '';
    
        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('formas de evaluación'))?.id || 0,
            result: hasFormas ? 1 : 0,
            observation: hasFormas
                ? 'Se describen formas e instrumentos de evaluación'
                : 'No se describen formas e instrumentos de evaluación'
        });
    
        // Indicador: Actividades y ponderaciones
        const tables = Array.from(doc.querySelectorAll("table")) as HTMLTableElement[];
        const activitiesTable = tables[1]; // Segunda tabla con actividades y ponderaciones
    
        const rows = activitiesTable
            ? Array.from(activitiesTable.querySelectorAll("tr")) as HTMLTableRowElement[]
            : [];
        const hasValidActivities = rows.some(row => {
            const cells = Array.from(row.querySelectorAll("td")) as HTMLTableCellElement[];
            return cells.length === 3 && cells[2]?.textContent?.trim().endsWith('%');
        });
    
        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('actividades'))?.id || 0,
            result: hasValidActivities ? 1 : 0,
            observation: hasValidActivities
                ? 'Se describen actividades y sus ponderaciones'
                : 'No se describen actividades o sus ponderaciones'
        });
    
        // Indicador: Total de ponderaciones es 100%
        const totalRow = rows.find(row => row.textContent?.toLowerCase().includes('total'));
        const lastCell = totalRow
            ? (Array.from(totalRow.querySelectorAll("td")).pop() as HTMLTableCellElement)
            : null;
        const totalPonderacion = lastCell
            ? lastCell.textContent?.replace('%', '').trim()
            : null;
        const isValidTotal = totalPonderacion === '100';
    
        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('porcentajes'))?.id || 0,
            result: isValidTotal ? 1 : 0,
            observation: isValidTotal
                ? 'El total de las ponderaciones suma 100%'
                : 'El total de las ponderaciones no suma 100%'
        });
    
        // Indicador: Explica las Unidades a evaluar
        const unitsExplained = rows.some(row => {
            const cells = Array.from(row.querySelectorAll("td")) as HTMLTableCellElement[];
            return cells.length > 1 && cells[1]?.textContent?.trim().match(/^(i|ii|iii|iv|v)/i);
        });
    
        results.push({
            indicatorId: indicators.find(i => i.name.toLowerCase().includes('explica las unidades'))?.id || 0,
            result: unitsExplained ? 1 : 0,
            observation: unitsExplained
                ? 'Se explican las unidades a evaluar'
                : 'No se explican las unidades a evaluar'
        });
    
        return results;
    }    

    private findContentByName(contents: any[], name: string) {
        const validContents = contents.filter(item => item.filename == 'index.html');

        const result = validContents.find(content => {
            if (!content.content) {
                console.warn('Content field is undefined:', content);
                return false;
            }

            return content.content.toLowerCase().includes(name.toLowerCase());
        });

        return result;
    }
}
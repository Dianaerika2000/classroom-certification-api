import { Injectable } from '@nestjs/common';
import technicalConfig from '../config/technical-design-config.json';
import { IndicatorResult } from 'src/evaluation/interfaces/indicator-result.interface';

@Injectable()
export class TechnicalDesignService {
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
            'Etiqueta': this.evaluateLabelResource.bind(this),
            'Datos de la asignatura': this.evaluatePedagogicalFolderResource.bind(this),
            'Contenido de la asignatura y referencias bibliográficas': this.evaluatePedagogicalFolderResource.bind(this),
            'Carta descriptiva': this.evaluatePedagogicalFolderResource.bind(this),
            'Guía de aprendizaje': this.evaluatePedagogicalFolderResource.bind(this),
            'Sistema de evaluación': this.evaluatePedagogicalFolderResource.bind(this),
            'Curriculum vitae del autor del contenido del aula': this.evaluatePedagogicalFolderResource.bind(this),
            'Video de presentación': this.evaluateVideoPresentation.bind(this)
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
     * Función para evaluar los indicadores del recurso: Carpeta pedagógica
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluatePedagogicalFolderResource(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const indicatorHandlers = {
                'general': async (indicator: any) => {
                    return this.evaluateGeneralIndicatorFolder(indicator, matchedContent)
                },
                'contenido': async (indicator: any) => {
                    return this.evaluateContentIndicatorFolder(indicator, matchedContent)
                },
                'sin restricciones': async (indicator: any) => {
                    return this.evaluateAccessRestrictions(indicator, matchedContent);
                },
                'Solo ver': async (indicator: any) => {
                    return this.evaluateActivityCompletion(indicator, matchedContent);
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

    private evaluateGeneralIndicatorFolder(indicator: any, matchedContent: any): IndicatorResult {
        // Buscar "Carpeta pedagógica" dentro del array de recursos
        const pedagogicalFolderConfig = technicalConfig.resources.find(resource =>
            resource.name.toLowerCase() === 'carpeta pedagógica'
        );

        // Verificar si la carpeta pedagógica existe en la configuración
        if (!pedagogicalFolderConfig) {
            return {
                indicatorId: indicator.id,
                result: 0,
                observation: 'Configuración de "Carpeta Pedagógica" no encontrada en el archivo de configuración.',
            };
        }

        const config = pedagogicalFolderConfig.general; 
        const isNameValid = matchedContent.name.toLowerCase() == config.name;
        //const isDescriptionValid = matchedContent.summary ? false : true; 

        //const result = isNameValid && isDescriptionValid ? 1 : 0;
        const result = isNameValid ? 1 : 0;

        return {
            indicatorId: indicator.id,
            result,
            observation: result
                ? 'Cumple con la configuración general.'
                : 'No cumple con la configuración general.',
        };
    }

    private evaluateAccessRestrictions(indicator: any, matchedContent: any): IndicatorResult {
        const hasRestrictions = this.hasRestrictions(matchedContent);

        return {
            indicatorId: indicator.id,
            result: hasRestrictions ? 0 : 1,
            observation: hasRestrictions
                ? 'No cumple con la configuración de restricciones de acceso.'
                : 'Cumple con la configuración de restricciones de acceso.',
        };
    }

    private evaluateActivityCompletion(indicator: any, matchedContent: any): IndicatorResult {
        const completionValid = this.hasCompletionDataView(matchedContent);

        return {
            indicatorId: indicator.id,
            result: completionValid ? 1 : 0,
            observation: completionValid
                ? 'Cumple con la configuración de finalización "Solo ver".'
                : 'No cumple con la configuración de finalización "Solo ver".',
        };
    }

    private evaluateContentIndicatorFolder(indicator: any, matchedContent: any): IndicatorResult {
        const requiredContents = [
            'datos generales', 
            'carta descriptiva',
            'evaluación',
            'guía de aprendizaje',
            'contenido', 
            'currículum vitae',
        ];
    
        const contents = matchedContent?.contents && Array.isArray(matchedContent.contents)
            ? matchedContent.contents
            : [];
        
        const filteredContents = contents.filter(content => content.filename && content.filename.toLowerCase() === 'index.html');
        const presentContents: string[] = [];
        const missingContents: string[] = [];
    
        requiredContents.forEach(requiredContent => {
            const isPresent = filteredContents.some(content => 
                content.content?.toLowerCase().includes(requiredContent.toLowerCase())
            );
            if (isPresent) {
                presentContents.push(requiredContent);
            } else {
                missingContents.push(requiredContent);
            }
        });
    
        const hasRequiredContents = missingContents.length === 0;
        const observation = hasRequiredContents
            ? `Se encontraron todos los contenidos requeridos: ${presentContents.join(', ')}.`
            : `Faltan los siguientes contenidos requeridos: ${missingContents.join(', ')}.`;
    
        return {
            indicatorId: indicator.id,
            result: hasRequiredContents ? 1 : 0,
            observation,
        };
    }              

    /**
     * Función para evaluar los indicadores del recurso: Video de Presentación
     * @param indicators 
     * @param matchedSection 
     * @param matchedModule 
     * @returns 
     */
    private async evaluateVideoPresentation(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
        const results: IndicatorResult[] = []; // Array para almacenar resultados

        if (matchedContent != null) {
            const indicatorHandlers = {
                'sin restricciones de acceso': async (indicator: any) => {
                    return this.evaluateAccessRestrictions(indicator, matchedContent);
                },
                'Solo ver': async (indicator: any) => {
                    return this.evaluateActivityCompletion(indicator, matchedContent);
                }
            };

            for (const indicator of indicators) {
                const handlerKey = Object.keys(indicatorHandlers).find(key =>
                    indicator.name.trim().toLowerCase().includes(key.toLowerCase())
                );

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

    private hasRestrictions(module: any): boolean {
        return this.hasAvailabilityRestrictions(module) || this.hasVisibilityRestrictions(module);
    }

    // Validar restricciones en el campo `availability`
    private hasAvailabilityRestrictions(module: any): boolean {
        if (!module.availability) return false;

        try {
            const availability = JSON.parse(module.availability);
            return Boolean(availability.c && availability.c.length > 0);
        } catch (error) {
            console.error("Error al analizar las restricciones de disponibilidad:", error);
            return false;
        }
    }

    // Validar restricciones relacionadas con visibilidad
    private hasVisibilityRestrictions(module: any): boolean {
        return (
            module.visible === 0 ||
            module.visibleoncoursepage === 0 ||
            module.uservisible === false
        );
    }

    // Validar restricciones en el campo `availability`
    private hasCompletionDataView(module: any): boolean {
        if (!module.completiondata || !module.completiondata.details) return false;

        const viewRule = module.completiondata.details.find(
            (rule: any) => rule.rulename === "completionview"
        );

        return Boolean(viewRule);
    }
}

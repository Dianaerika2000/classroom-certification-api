import { Injectable } from '@nestjs/common';
import { AreaService } from 'src/area/area.service';
import { CycleService } from 'src/cycle/cycle.service';
import { IndicatorService } from 'src/indicator/indicator.service';
import { Cycle1TechnicalDesignService, Cycle1TrainingDesignService, Cycle3TechnicalDesignService, Cycle3TrainingDesignService, TechnicalDesignCycleIiService, TechnicalDesignService, TrainingDesignCycleIiService, TrainingDesignService, GraphicDesignService } from '../cycles/cycles';

enum AreaType {
    Formacion = 'formación',
    Tecnico = 'técnico',
    Grafico = 'gráfico'
}

enum CycleType {
    Organizacionales = 'organizacionales',
    CicloII = 'ciclo 2',
    CicloI = 'ciclo i',
    CicloIII = 'ciclo 3'
}

interface EvaluationContext {
    areaId: number;
    cycleId: number;
    token?: string;
    courseid?: number;
}

@Injectable()
export class IndicatorEvaluationService {
    private readonly evaluationServices = {
        [`${AreaType.Formacion}_${CycleType.Organizacionales}`]: {
            service: this.organizationalAspectsTrainingService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Tecnico}_${CycleType.Organizacionales}`]: {
            service: this.organizationalAspectsTechnicalService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Grafico}_${CycleType.Organizacionales}`]: {
            service: this.graphicDesignService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Formacion}_${CycleType.CicloI}`]: {
            service: this.cycleiTrainingService,
            method: 'evaluateIndicatorsByContent'
        },
        [`${AreaType.Tecnico}_${CycleType.CicloI}`]: {
            service: this.cycleiTechnicalService,
            method: 'evaluateIndicatorsByContent'
        },
        [`${AreaType.Grafico}_${CycleType.CicloI}`]: {
            service: this.graphicDesignService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Formacion}_${CycleType.CicloII}`]: {
            service: this.cycleiiTrainingService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Tecnico}_${CycleType.CicloII}`]: {
            service: this.cycleiiTechnicalService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Grafico}_${CycleType.CicloII}`]: {
            service: this.graphicDesignService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Formacion}_${CycleType.CicloIII}`]: {
            service: this.cycleiiiTrainingService,
            method: 'evaluateIndicatorsByResource'
        },
        [`${AreaType.Tecnico}_${CycleType.CicloIII}`]: {
            service: this.cycleiiiTechnicalService,
            method: 'evaluateIndicatorsByResource'
        },
        [`${AreaType.Grafico}_${CycleType.CicloIII}`]: {
            service: this.graphicDesignService,
            method: 'evaluateContentIndicators'
        },
    }

    constructor(
        private readonly areaService: AreaService,
        private readonly cycleService: CycleService,
        private readonly indicatorService: IndicatorService,
        private readonly organizationalAspectsTrainingService: TrainingDesignService,
        private readonly organizationalAspectsTechnicalService: TechnicalDesignService,
        private readonly cycleiTrainingService: Cycle1TrainingDesignService,
        private readonly cycleiTechnicalService: Cycle1TechnicalDesignService,
        private readonly cycleiiTrainingService: TrainingDesignCycleIiService,
        private readonly cycleiiTechnicalService: TechnicalDesignCycleIiService,
        private readonly cycleiiiTrainingService: Cycle3TrainingDesignService,
        private readonly cycleiiiTechnicalService: Cycle3TechnicalDesignService,
        private readonly graphicDesignService: GraphicDesignService
    ) { }

    async evaluateIndicators(
        matchedResources: any[],
        context: EvaluationContext
    ): Promise<any[]> {
        return Promise.all(
            matchedResources.map(async (item) => {
                try {
                    if (item.resource.cycle) {
                        return await this.evaluateResourceIndicators(item, context);
                    } else if (item.resource.resource) {
                        return await this.evaluateContentIndicators(item, context);
                    }
                    throw new Error(`Estructura desconocida en el recurso: ${JSON.stringify(item)}`);
                } catch (error) {
                    console.error(`Error evaluando recurso ${item.resource.id}:`, error);
                    return {
                        resourceId: item.resource.id,
                        error: error.message
                    };
                }
            })
        );
    }

    private async evaluateContentIndicators(
        item: any,
        context: EvaluationContext
    ): Promise<any> {
        const { resource, matchedSection, matchedModule } = item;
        const result = {
            resourceId: resource.id,
            resourceName: resource.name,
            contents: { match: [], noMatch: [] }
        };

        const matchResult = await this.evaluateContentMatch(
            resource,
            matchedSection,
            matchedModule,
            context,
            'content'
        );

        if (matchResult) {
            result.contents.match.push(matchResult);
        }

        return result;
    }

    private async evaluateResourceIndicators(
        item: any,
        context: EvaluationContext
    ): Promise<any> {
        // Similar implementation to evaluateContentIndicators
        const { resource, matchedSection, matchedModule } = item;
        const result = {
            resourceId: resource.id,
            resourceName: resource.name,
            contents: { match: [], noMatch: [] }
        };

        const matchResult = await this.evaluateContentMatch(
            resource,
            matchedSection,
            matchedModule,
            context,
            'resource'
        );

        if (matchResult) {
            result.contents.match.push(matchResult);
        }

        return result;
    }

    private async evaluateContentMatch(
        content: any,
        matchedSection: any,
        matchedModule: any,
        { areaId, cycleId, token, courseid }: EvaluationContext,
        type: 'content' | 'resource'
    ) {
        if (content.name.toLowerCase().includes('carpeta')) return;

        const [area, cycle] = await Promise.all([
            this.areaService.findOne(areaId),
            this.cycleService.findOne(cycleId)
        ]);

        if (!area || !cycle) {
            throw new Error(`Área o ciclo no encontrado: areaId=${areaId}, cycleId=${cycleId}`);
        }

        const indicators = type === 'content'
            ? await this.indicatorService.findByAreaAndContent(areaId, content.id)
            : await this.indicatorService.findByAreaAndResource(areaId, content.id);

        // Determinar qué contenido enviar
        const contentToSend = this.getValidContent(matchedSection, matchedModule);

        const areaType = area.name.toLowerCase().includes('formación')
            ? AreaType.Formacion
            : area.name.toLowerCase().includes('técnico')
                ? AreaType.Tecnico
                : AreaType.Grafico;

        const cycleType = cycle.name.toLowerCase().includes('organizacionales')
            ? CycleType.Organizacionales
            : cycle.name.toLowerCase().includes('ciclo i')
                ? CycleType.CicloI
                : cycle.name.toLowerCase().includes('ciclo 2')
                    ? CycleType.CicloII
                    : CycleType.CicloIII

        const evaluationKey = `${areaType}_${cycleType}`;
        const evaluationConfig = this.evaluationServices[evaluationKey];

        if (!evaluationConfig) {
            throw new Error(`Combinación no soportada de área y ciclo: ${evaluationKey}`);
        }

        return await evaluationConfig.service[evaluationConfig.method](
            content,
            indicators,
            contentToSend,
            token,
            courseid
        );
    }

    private getValidContent(matchedSection: any, matchedModule: any): any {
        const isValidContent = (content: any): boolean => {
            if (Array.isArray(content)) {
                return content.length > 0 && content.every(item => typeof item === 'object' && item !== null);
            }
            return typeof content === 'object' && content !== null;
        };

        return isValidContent(matchedSection) ? matchedSection : matchedModule;
    }
}

import { Injectable } from '@nestjs/common';
import { AreaService } from 'src/area/area.service';
import { CycleService } from 'src/cycle/cycle.service';
import { IndicatorService } from 'src/indicator/indicator.service';
import { ResourceService } from 'src/resource/resource.service';
import { TrainingDesignService } from '../organizational-aspects/training-design/training-design.service';
import { TechnicalDesignService } from '../organizational-aspects/technical-design/technical-design.service';
import { TrainingDesignCycleIiService } from '../cycle-ii/training-design-cycle-ii/training-design-cycle-ii.service';
import { TechnicalDesignCycleIiService } from '../cycle-ii/technical-design-cycle-ii/technical-design-cycle-ii.service';

enum AreaType {
    Formacion = 'formación',
    Tecnico = 'técnico'
}

enum CycleType {
    Organizacionales = 'organizacionales',
    CicloII = 'ciclo 2'
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
        [`${AreaType.Formacion}_${CycleType.CicloII}`]: {
            service: this.cycleiiTrainingService,
            method: 'evaluateContentIndicators'
        },
        [`${AreaType.Tecnico}_${CycleType.CicloII}`]: {
            service: this.cycleiiTechnicalService,
            method: 'evaluateContentIndicators'
        },
    }

    constructor(
        private readonly areaService: AreaService,
        private readonly cycleService: CycleService,
        private readonly indicatorService: IndicatorService,
        private readonly organizationalAspectsTrainingService: TrainingDesignService,
        private readonly organizationalAspectsTechnicalService: TechnicalDesignService,
        private readonly cycleiiTrainingService: TrainingDesignCycleIiService,
        private readonly cycleiiTechnicalService: TechnicalDesignCycleIiService,
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

    private async evaluateContentMatch(
        content: any,
        matchedSection: any,
        matchedModule: any,
        { areaId, cycleId, token, courseid }: EvaluationContext,
        type: 'content' | 'resource'
    ) {
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
            : AreaType.Tecnico;

        const cycleType = cycle.name.toLowerCase().includes('organizacionales')
            ? CycleType.Organizacionales
            : CycleType.CicloII;

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

    private async evaluateResourceIndicators(
        item: any,
        context: EvaluationContext
    ): Promise<any> {
        // Similar implementation to evaluateContentIndicators
        const { resource, matchedSection, matchedModule } = item;
        const result = {
            resourceId: resource.id,
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
}

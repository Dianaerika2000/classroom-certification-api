import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { Repository } from 'typeorm';
import { MoodleService } from '../moodle/moodle.service';
import { ClassroomService } from '../classroom/classroom.service';
import { CycleService } from '../cycle/cycle.service';
import { ResourceService } from '../resource/resource.service';
import { IndicatorService } from '../indicator/indicator.service';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    private readonly classroomService: ClassroomService,
    private readonly moodleService: MoodleService,
    private readonly cycleService: CycleService,
    private readonly resourceService: ResourceService,
    private readonly indicatorService: IndicatorService,
  ){}

  async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation>  {
    const { classroomId, ...evaluationData } = createEvaluationDto;
    
    const classroom = await this.classroomService.findOne(classroomId);

    const evaluation = this.evaluationRepository.create({
      ...evaluationData,     
      result: evaluationData.result ?? 0,
      classroom,               
    });

    return await this.evaluationRepository.save(evaluation);
  }

  async findAll(): Promise<Evaluation[]> {
    return await this.evaluationRepository.find();
  }

  async findByClassroom(classroomId: number): Promise<Evaluation[]> {
    const classroom = await this.classroomService.findOne(classroomId);
    
    if (!classroom) {
      throw new NotFoundException(`Aula con ID ${classroomId} no encontrada`);
    }
    
    const evaluations = await this.evaluationRepository.find({
      where: { classroom: { id: classroomId } }, 
      relations: ['classroom'],
    });
    
    return evaluations;
  }

  async findOne(id: number): Promise<Evaluation>{
    const evaluation = await this.evaluationRepository.findOneBy({ id });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID "${id}" not found`);
    }
    
    return evaluation;
  }

  async update(id: number, updateEvaluationDto: UpdateEvaluationDto): Promise<Evaluation>{
    const evaluation = await this.evaluationRepository.preload({
      id: id,
      ...updateEvaluationDto,
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID "${id}" not found`);
    }

    return await this.evaluationRepository.save(evaluation);
  }

  async remove(id: number) {
    const evaluation = await this.findOne(id);

    return await this.evaluationRepository.remove(evaluation); 
  }

  /**
   * Obtiene los recursos asociados a un ciclo específico
   */
  async getResourcesByCycle(cycleId: number) {
    return await this.resourceService.findAllByCycle(cycleId);
  }

  /**
   * Obtiene los contenidos de un recurso específico
   */
  async getContentsByResource(resourceId: number) {
    return await this.resourceService.findContents(resourceId);
  }

  /**
   * Obtiene los indicadores asociados a un área específica para un recurso específico
   */
  async getIndicatorsByAreaAndResource(areaId: number, resourceId: number) {
    return await this.indicatorService.findByAreaAndResource(areaId, resourceId);
  }

  /**
   * Obtiene los indicadores asociados a un área específica para un contenido específico
   */
  async getIndicatorsByAreaAndContent(areaId: number, contentId: number) {
    return await this.indicatorService.findByAreaAndContent(areaId, contentId);
  }

  /**
 * Realiza el análisis de cumplimiento del aula de Moodle contra los indicadores definidos.
 */
  async analyzeClassroomCompliance(
    moodleCourseId: number,
    token: string,
    cycleId: number,
    areaId: number
  ): Promise<any> {
    try {
      // Paso 1: Obtiene los contenidos del curso desde Moodle que coinciden con los recursos
      const { matchedResources, unmatchedResources } = await this.fetchAndMatchCourseContents(moodleCourseId, token, cycleId);

      // Paso 2: Evalúa el cumplimiento de los indicadores por cuadrante (ciclo y área) solo para los recursos que hicieron match
      const results = await this.evaluateIndicatorsForMatchedContents(matchedResources, areaId);
  
      // Devuelve los resultados de la evaluación, incluyendo los recursos que no hicieron match
      return {
        message: "Análisis de cumplimiento del aula completado exitosamente",
        data: {
          matchedResults: results,
          unmatchedResources: unmatchedResources
        },
      };
    } catch (error) {
      throw new Error(`Error durante el análisis de cumplimiento del aula: ${error.message}`);
    }
  }

  /**
   * Obtiene y verifica el contenido del curso de Moodle, buscando coincidencias con los recursos en la base de datos.
   */
  async fetchAndMatchCourseContents(moodleCourseId: number, token: string, cycleId: number): Promise<any> {
    try {
      // Obtiene el contenido del curso desde Moodle usando el ID del curso en Moodle
      const courseContents = await this.moodleService.getCourseContents(moodleCourseId, token);
  
      if (!courseContents || courseContents.length === 0) {
        throw new NotFoundException(`Contenido no encontrado para el curso con ID en Moodle ${moodleCourseId}`);
      }
  
      // Obtiene los recursos asociados al ciclo de la base de datos usando cycleId
      let resources = await this.getResourcesByCycle(cycleId);
  
      const matchedResources = [];
  
      // Recorre cada sección del curso
      for (const section of courseContents) {
        // Coincidencia de nombre entre la sección y los recursos
        resources = resources.filter(resource => {
          if (section.name && section.name.toLowerCase() === resource.name.toLowerCase()) {
            matchedResources.push({
              resource,
              matchedSection: section, // Toda la información de la sección
              matchedModule: null, // Coincidencia en la sección, no en un módulo específico
            });
            return false; // Elimina el recurso coincidente de la lista
          }
          return true;
        });
  
        // Si no se encuentra coincidencia en la sección, revisa sus módulos
        if (section.modules && section.modules.length > 0) {
          for (const module of section.modules) {
            resources = resources.filter(resource => {
              if (module.name && module.name.toLowerCase() === resource.name.toLowerCase()) {
                matchedResources.push({
                  resource,
                  matchedSection: section.name,
                  matchedModule: module, // Toda la información del módulo
                });
                return false; // Elimina el recurso coincidente de la lista
              }
              return true;
            });
          }
        }
      }

      // Los recursos restantes son los que no hicieron match
      const unmatchedResources = resources.map(resource => ({
        resource,
        matchedSection: null,
        matchedModule: null,
      }));

      return {
        matchedResources,
        unmatchedResources
      };
    } catch (error) {
      throw new NotFoundException(`Error obteniendo contenido del curso desde Moodle: ${error.message}`);
    }
  }
  
  async evaluateIndicatorsForMatchedContents(
    matchedContents: any[],
    areaId: number
  ): Promise<any> {
    const results = [];
  
    for (const item of matchedContents) {
      const { resource, matchedSection, matchedModule } = item;
  
      // Verifica si el recurso tiene contenidos específicos
      const contents = await this.getContentsByResource(resource.id);
  
      if (contents && contents.length > 0) {
        // Llama a la función secundaria para evaluar el cumplimiento de indicadores en el recurso específico
        const resourceResults = await this.evaluateContentIndicators(resource, contents, matchedSection, matchedModule, areaId);
  
        results.push(resourceResults);
      } else {
        // Si no hay contenidos, evalúa los indicadores del recurso directamente
        const resourceOnlyResults = await this.evaluateResourceIndicators(resource, matchedSection, matchedModule, areaId);
  
        results.push(resourceOnlyResults);
      }
    }
  
    console.log('Resultados finales de evaluateIndicatorsForMatchedContents:', results);
    return results;
  }  

  async evaluateResourceIndicators(
    resource: any,
    matchedSection: any,
    matchedModule: any,
    areaId: number
  ): Promise<any> {
    // Inicializa la estructura de respuesta para el recurso
    const result = {
      resourceId: resource.id,
      contents: null, // No hay contenido específico en este caso
      indicators: [],
    };
  
    // Obtiene los indicadores directamente asociados al recurso y área
    const indicators = await this.getIndicatorsByAreaAndResource(areaId, resource.id);
  
    for (const indicator of indicators) {
      let indicatorResult = 0;
  
      // Llama a una función genérica que evalúa el cumplimiento del indicador en el recurso
      if (matchedSection) {
        indicatorResult = this.checkIndicatorCompliance(indicator, matchedSection);
      } else if (matchedModule) {
        indicatorResult = this.checkIndicatorCompliance(indicator, matchedModule);
      }
  
      // Agrega el resultado de la evaluación del indicador a la lista de indicadores del recurso
      result.indicators.push({
        indicatorId: indicator.id,
        result: indicatorResult,
      });
    }
  
    return result;
  }
  
  async evaluateContentIndicators(
    resource: any,
    contents: any[],
    matchedSection: any,
    matchedModule: any,
    areaId: number
  ): Promise<any> {
    const result = {
      resourceId: resource.id,
      contents: {
        match: [],
        noMatch: [],
      },
    };

    for (const content of contents) {
      const contentName = content?.name?.toLowerCase() || "";
      let foundContent = null;
      let indicatorsResult = [];

      // Coincidencia en secciones o módulos con coincidencia flexible
      if (matchedSection?.name && matchedSection.name.toLowerCase().includes(contentName)) {
        foundContent = matchedSection;
      } else if (matchedModule?.name && matchedModule.name.toLowerCase().includes(contentName)) {
        foundContent = matchedModule;
      } else if (matchedModule?.contents) {
        // Busca en contenidos específicos dentro del módulo
        foundContent = matchedModule.contents.find((moduleContent: any) =>
          moduleContent?.content && moduleContent.content.toLowerCase().includes(contentName)
        );
      }

      if (foundContent) {
        // Evaluar los indicadores para los contenidos que hicieron match
        const indicators = await this.getIndicatorsByAreaAndContent(areaId, content.id);
        for (const indicator of indicators) {
          const indicatorResult = this.checkIndicatorCompliance(indicator, foundContent);
          indicatorsResult.push({
            indicatorId: indicator.id,
            result: indicatorResult,
          });
        }
        result.contents.match.push({
          contentId: content.id,
          indicators: indicatorsResult,
        });
      } else {
        // Registra el contenido en noMatch si no hizo coincidencia
        indicatorsResult.push({
          indicatorId: null,
          result: 0,
        });
        result.contents.noMatch.push({
          contentId: content.id,
          indicators: indicatorsResult,
        });
      }
    }

    return result;
  }
  
  /**
   * Verifica si un contenido cumple con el indicador específico.
   */
  checkIndicatorCompliance(indicator: any, foundContent: any): number {
    console.log('Evaluando indicador:', indicator);
    console.log('Contenido encontrado:', foundContent);
  
    // Por ahora, forzamos que siempre devuelva 1 para verificar su funcionamiento
    return 1;
  }  
}

import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';
import { FileContent } from '../../../interfaces/file-content.interface';
import { MoodleService } from '../../../../moodle/moodle.service';

@Injectable()
export class Cycle1TrainingDesignService {
  constructor(
    private readonly moodleService: MoodleService,
  ) { }
  /**
   * Evalúa los indicadores asociados a un contenido específico del Ciclo 1
   */
  evaluateIndicatorsByContent(
    content: any,
    indicators: any[],
    matchedContent: any,
    token?: string
  ): IndicatorResult[] {
    const contentEvaluator = this.getContentEvaluator(content.name);

    if (!contentEvaluator) {
      // Si no hay evaluador para este contenido, marca todos los indicadores para revisión manual
      return indicators.map(indicator => ({
        indicatorId: indicator.id,
        result: 0,
        observation: `El contenido "${content.name}" requiere verificación manual`
      }));
    }

    return contentEvaluator(indicators, matchedContent, token);
  }

  /**
    * Retorna la función evaluadora específica según el contenido
    */
  private getContentEvaluator(contentName: string): ((indicators: any[], matchedContent: any, token?: string) => IndicatorResult[]) | null {
    const contentEvaluators = {
      'Mapa de inicio': this.evaluateMapaInicio.bind(this),
      'Lección de conocimientos previos': this.evaluatePriorKnowledgeLesson.bind(this),
      'Cuestionario diagnóstico': this.evaluateDiagnosticQuiz.bind(this),
      'Bibliografía': this.evaluateBibliography.bind(this),
    };

    // Busca coincidencia exacta o parcial
    const evaluator = Object.entries(contentEvaluators).find(([key]) =>
      contentName.toLowerCase().includes(key.toLowerCase())
    );

    return evaluator ? evaluator[1] : null;
  }

  private async evaluateMapaInicio(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    return this.evaluateUnimplementedContent(indicators, matchedContent, "Mapa de inicio");
  }

  /**
   * Evalúa indicadores relacionados con la lección de conocimientos previos
   */
  private async evaluatePriorKnowledgeLesson(indicators: any[], matchedContent: any, token?: string): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    const indicatorHandlers = {
      'conocimientos previos': async (indicator: any) => {
        return this.checkPriorKnowledgeGuide(indicator, matchedContent, token);
      },
      'autocalificables': async (indicator: any) => {
        return this.checkAutoGradedQuestions(indicator, matchedContent, token);
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
          observation: 'Este indicador requiere verificación manual del formato del contenido',
        });
      }
    }

    return results; 
  }

  /**
   * Evalúa indicadores relacionados con el cuestionario diagnóstico
   */
  private async evaluateDiagnosticQuiz(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    return this.evaluateUnimplementedContent(indicators, matchedContent, "Cuestionario diagnóstico");
  }

  /**
   * Evalúa indicadores relacionados con la bibliografía
   */
  private async evaluateBibliography(indicators: any[], matchedContent: any): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];

    const indicatorHandlers = {
      'documentos digitales': async (indicator: any) => {
        return this.checkDigitalDocumentsOrderedByUnit(indicator, matchedContent);
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

    return results; 
  }

  // Métodos específicos de validación
  private async checkPriorKnowledgeGuide(indicator: any, matchedContent: any, token: string): Promise<IndicatorResult> {
    if (matchedContent.modname !== 'lesson') {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontró contenido de tipo Lección'
      }
    }

    const lessonPages = await this.moodleService.getLessonPages(matchedContent.instance, token);
    if (!lessonPages) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontraron páginas en la lección'
      }
    }

    // Verificar si al menos una página tiene "qtype" igual a "Contenido"
    const hasContentPage = lessonPages.some(page => page.page.qtype === 20);

    return {
      indicatorId: indicator.id,
      result: hasContentPage ? 1 : 0,
      observation: hasContentPage ? '' : 'No se encontró lectura guía de conocimientos previos'
    };
  }

  private async checkAutoGradedQuestions(indicator: any, matchedContent: any, token: string): Promise<IndicatorResult> {
      // Llamamos al servicio de Moodle para obtener las páginas de la lección.
      const pages = await this.moodleService.getLessonPages(matchedContent.instance, token);
      
      if (!pages || pages.length === 0) {
        return {
          indicatorId: indicator.id,
          result: 0,
          observation: 'No se encontraron páginas en la lección'
        };
      }
  
      // Tipos de preguntas autocalificables según Moodle (por ejemplo, Multiple Choice, True/False, etc.)
      const autoGradedQuestionTypes = [3, 4, 5, 8];
  
      // Imprimir en consola el 'qtype' de cada página para verificar
      pages.forEach(page => {
        console.info(`Page ID: ${page.page.id}, Qtype: ${page.page.qtype}`);
      });
  
      // Verificar si existe al menos una página de tipo pregunta autocalificable
      const hasAutoGradedQuestions = pages.some(page => autoGradedQuestionTypes.includes(page.page.qtype));
      console.info(`hasAutoGradedQuestions: ${hasAutoGradedQuestions}`);
  
      // Si no hay ninguna página autocalificable y todas las páginas son de tipo contenido (qtype = 20)
      if (!hasAutoGradedQuestions && pages.every(page => page.page.qtype === 20)) {
        return {
          indicatorId: indicator.id,
          result: 0,
          observation: 'La lección solo contiene páginas de contenido, sin preguntas autocalificables'
        };
      }
  
      return {
        indicatorId: indicator.id,
        result: hasAutoGradedQuestions ? 1 : 0,
        observation: hasAutoGradedQuestions ? '' : 'No se encontraron preguntas autocalificables en la lección'
      };
  }

  private checkDigitalDocumentsOrderedByUnit(indicator: any, matchedContent: any): IndicatorResult {
    if (matchedContent.modname !== 'folder') {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'El contenido no es una carpeta'
      };
    }

    const { contents } = matchedContent;
    if (!contents || contents.length === 0) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'La carpeta no contiene archivos'
      };
    }

    // Agrupar los archivos por su filepath
    const filesByPath = contents.reduce((groups: { [key: string]: FileContent[] }, content) => {
      const path = content.filepath;

      if (!groups[path]) {
        groups[path] = [];
      }

      groups[path].push(content);
      return groups;
    }, {});

    // Obtener los grupos únicos de rutas
    const pathGroups = Object.keys(filesByPath);

    if (pathGroups.length < 2) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No hay suficientes subcarpetas diferentes (mínimo 2 requeridas)'
      };
    }

    // Verificar que cada grupo tenga al menos un archivo
    const allGroupsHaveFiles = pathGroups.every(path => {
      const files = filesByPath[path];
      const hasFiles = files.length > 0;
      return hasFiles;
    });

    if (!allGroupsHaveFiles) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'Existen subcarpetas sin archivos'
      };
    }

    // Verificar que al menos un grupo tenga una ruta que incluya la palabra "unidad" o "unit"
    const hasUnitPath = pathGroups.some(path =>
      path.toLowerCase().includes('unidad') ||
      path.toLowerCase().includes('unit')
    );

    if (!hasUnitPath) {
      return {
        indicatorId: indicator.id,
        result: 0,
        observation: 'No se encontrarion carpetas nombradas como Unidad'
      };
    }

    return {
      indicatorId: indicator.id,
      result: 1,
      observation: ''
    };
  }

  private async evaluateUnimplementedContent(indicators: any[], matchedContent: any, contentName: string): Promise<IndicatorResult[]> {
    return indicators.map(indicator => ({
      indicatorId: indicator.id,
      result: 0,
      observation: `El indicador "${indicator.name}" requiere revisión manual.`
    }));
  }
}

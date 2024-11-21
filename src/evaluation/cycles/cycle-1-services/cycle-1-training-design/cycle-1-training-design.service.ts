import { Injectable } from '@nestjs/common';
import { IndicatorResult } from '../../../interfaces/indicator-result.interface';
import { FileContent } from '../../../interfaces/file-content.interface';
import { MoodleService } from '../../../../moodle/moodle.service';

@Injectable()
export class Cycle1TrainingDesignService {
  constructor(
    private readonly moodleService: MoodleService,
  ){}
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
  
    if (content.name === "Lección de conocimientos previos") {
      return contentEvaluator(indicators, matchedContent, token);
    }
  
    return contentEvaluator(indicators, matchedContent);
  }
  

  /**
    * Retorna la función evaluadora específica según el contenido
    */
  private getContentEvaluator(contentName: string): ((indicators: any[], matchedContent: any, token?: string) => IndicatorResult[]) | null {
    const contentEvaluators = {
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

  /**
   * Evalúa indicadores relacionados con la lección de conocimientos previos
   */
  private async evaluatePriorKnowledgeLesson(indicators: any[], matchedContent: any, token?: string): Promise<IndicatorResult[]> {
    const results: IndicatorResult[] = [];  

    for (const indicator of indicators) {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'contiene lectura guía de conocimientos previos':
          const hasGuide = await this.checkPriorKnowledgeGuide(matchedContent, token);  
          results.push({
            indicatorId: indicator.id,
            result: hasGuide ? 1 : 0,
            observation: hasGuide ? '' : 'No se encontró lectura guía de conocimientos previos',
          });
          break;
  
        case 'contiene preguntas autocalificables':
          const hasQuestions = await this.checkAutoGradedQuestions(matchedContent, token); 
          results.push({
            indicatorId: indicator.id,
            result: hasQuestions ? 1 : 0,
            observation: hasQuestions ? '' : 'No se encontraron preguntas autocalificables',
          });
          break;
  
        default:
          // Indicadores no evaluables automáticamente
          results.push({
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual`,
          });
          break;
      }
    }
  
    return results;  // Devolvemos los resultados al final de la ejecución
  }  

  /**
   * Evalúa indicadores relacionados con el cuestionario diagnóstico
   */
  private evaluateDiagnosticQuiz(indicators: any[], matchedContent: any): IndicatorResult[] {
    return indicators.map(indicator => {
      switch (indicator.name.toLowerCase()) {
        case 'contiene banco de preguntas mínimo 10 preguntas':
          const hasQuestionBank = this.checkQuestionBankWithMinimumQuestions(matchedContent);
          return {
            indicatorId: indicator.id,
            result: hasQuestionBank ? 1 : 0,
            observation: hasQuestionBank
              ? 'El cuestionario contiene un banco de preguntas con al menos 10 preguntas'
              : 'El cuestionario no tiene un banco de preguntas con al menos 10 preguntas'
          };

        case 'el cuestionario tiene 10 preguntas autocalificadas.':
          const hasAutoGradedQuestions = this.checkQuizWithAutoGradedQuestions(matchedContent);
          return {
            indicatorId: indicator.id,
            result: hasAutoGradedQuestions ? 1 : 0,
            observation: hasAutoGradedQuestions
              ? 'El cuestionario contiene 10 preguntas autocalificadas'
              : 'El cuestionario no contiene 10 preguntas autocalificadas'
          };

        default:
          // Indicadores no evaluables automáticamente
          return {
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual`
          };
      }
    });
  }

  /**
   * Evalúa indicadores relacionados con la bibliografía
   */
  private evaluateBibliography(indicators: any[], matchedContent: any): IndicatorResult[] {

    return indicators.map(indicator => {
      const normalizedName = this.normalizeIndicatorName(indicator.name);

      switch (normalizedName) {
        case 'contiene documentos digitales ordenados por unidad':
          const hasOrderedDocuments = this.checkDigitalDocumentsOrderedByUnit(matchedContent);
          return {
            indicatorId: indicator.id,
            result: hasOrderedDocuments ? 1 : 0,
            observation: hasOrderedDocuments
              ? 'Se encontraron documentos digitales ordenados por unidad'
              : 'No se encontraron documentos digitales ordenados por unidad'
          };

        default:
          // Indicadores no evaluables automáticamente
          return {
            indicatorId: indicator.id,
            result: 0,
            observation: `El indicador "${indicator.name}" requiere verificación manual`
          };
      }
    });
  }

  // Métodos específicos de validación
  private async checkPriorKnowledgeGuide(matchedContent: any, token: string): Promise<boolean> {
    if (matchedContent.modname !== 'lesson') {
      console.info('No se encontró contenido de tipo "lesson"');
      return false;
    }
  
    const lessonPages = await this.moodleService.getLessonPages(matchedContent.instance, token);
    if (!lessonPages) {
      return false;
    }
  
    // Verificar si al menos una página tiene "qtype" igual a "Contenido"
    const hasContentPage = lessonPages.some(page => page.page.qtype === 20);
    
    return hasContentPage;
  }
  

  private async checkAutoGradedQuestions(matchedContent: any, token: string): Promise<boolean> {
    // Llamamos al servicio de Moodle para obtener las páginas de la lección.
    const pages = await this.moodleService.getLessonPages(matchedContent.instance, token);
    
    // Tipos de preguntas autocalificables según Moodle (por ejemplo, Multiple Choice, True/False, etc.)
    const autoGradedQuestionTypes = [3, 4, 5, 8];
    
    // Imprimir en consola el 'qtype' de cada página para verificar
    pages.forEach(page => {
      console.info(`Page ID: ${page.page.id}, Qtype: ${page.page.qtype}`);
    });
    
    // Verificar si existe al menos una página de tipo pregunta autocalificable
    const hasAutoGradedQuestions = pages.some(page => autoGradedQuestionTypes.includes(page.page.qtype));
    console.info(`hasAutoGradedQuestions: ${hasAutoGradedQuestions}`);
    
    // Si no hay ninguna página autocalificable y todas las páginas son de tipo contenido (qtype = 20), devolvemos false
    if (!hasAutoGradedQuestions && pages.every(page => page.page.qtype === 20)) {
      return false;
    }
    
    // Devolver verdadero solo si hay al menos una pregunta autocalificable
    return hasAutoGradedQuestions;
  }

  private async checkQuestionBankWithMinimumQuestions(matchedContent: any): Promise<boolean> {

    return matchedContent?.questionBank?.length >= 10;
  }
  
  private checkQuizWithAutoGradedQuestions(matchedContent: any): boolean {
    // Implementar lógica para verificar preguntas autocalificadas
    return matchedContent?.questions?.filter(q => q.isAutoGraded).length >= 10;
  }
  
  private checkDigitalDocumentsOrderedByUnit(matchedContent): boolean {
    if (matchedContent.modname !== 'folder') {
      return false;
    }
    
    const { contents } = matchedContent;
    if (!contents || contents.length === 0) {
      return false;
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
    console.info('\nRutas únicas encontradas:', pathGroups);

    if (pathGroups.length < 2) {
      console.info('No hay suficientes grupos diferentes');
      return false;
    }

    // Verificar que cada grupo tenga al menos un archivo
    const allGroupsHaveFiles = pathGroups.every(path => {
      const files = filesByPath[path];
      const hasFiles = files.length > 0;
      console.info(`Grupo ${path} tiene ${files.length} archivos`);
      return hasFiles;
    });

    // Verificar que al menos un grupo tenga una ruta que incluya la palabra "unidad" o "unit"
    const hasUnitPath = pathGroups.some(path => 
      path.toLowerCase().includes('unidad') || 
      path.toLowerCase().includes('unit')
    );

    const result = allGroupsHaveFiles && hasUnitPath;
    return result;
  }
  
  private normalizeIndicatorName(name: string): string {
    return name.trim().replace(/\.$/, '').toLowerCase();
  }  
}

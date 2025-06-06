import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { areaAssessmentItems } from './config/assessment.constants';
import { RequerimentService } from './requeriment.service';
import { AreaService } from '../area/area.service';
import { FormService } from '../form/form.service';
import { TechnicalAreaService } from './areas/technical-area/technical-area.service';
import { GraphicAreaService } from './areas/graphic-area/graphic-area.service';
import { FormationAreaService } from './areas/formation-area/formation-area.service';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    private readonly areaService: AreaService,
    private readonly formService: FormService,
    private readonly requerimentService: RequerimentService,
    private readonly formationAreaService: FormationAreaService,
    private readonly technicalAreaService: TechnicalAreaService,
    private readonly graphicAreaService: GraphicAreaService
  ) { }

  async create(createAssessmentDto: CreateAssessmentDto, files?: Express.Multer.File[]): Promise<Assessment> {
    const { formId, areaId, ...assessmentData } = createAssessmentDto;

    const form = await this.formService.findOne(+formId);
    const area = await this.areaService.findOne(+areaId);

    const assessment = this.assessmentRepository.create({
      ...assessmentData,
      form,
      area,
    });
    const savedAssessment = await this.assessmentRepository.save(assessment);

    if (files && files.length > 0) {
      for (const file of files) {
        await this.requerimentService.create(
          {
            name: file.originalname,
            assessmentId: savedAssessment.id,
          },
          file,
        );
      }
    }

    const assessmentWithRequeriments = await this.assessmentRepository.findOne({
      where: { id: savedAssessment.id },
      relations: ['requeriments'],
    });

    return assessmentWithRequeriments;
  }

  async createByForm(createAssessmentDto: CreateAssessmentDto): Promise<Assessment[]> {
    const { formId } = createAssessmentDto;
    const createdAssessments: Assessment[] = [];

    const form = await this.formService.findOne(+formId);
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found.`);
    }

    for (const [areaName, items] of Object.entries(areaAssessmentItems)) {
      const area = await this.areaService.findByName(areaName);
      if (!area) {
        throw new NotFoundException(`Area with name ${areaName} not found.`);
      }

      for (const description of items) {
        let assessmentValue = 0;
  
        if (area.name.toLowerCase().includes('técnico')) {
          assessmentValue = await this.technicalAreaService.calculateAverageItem(
            description,
            area.id,
            form.classroom.id
          );
        } else if (area.name.toLowerCase().includes('gráfico')) {
          assessmentValue = await this.graphicAreaService.calculateAverageItem(
            description,
            area.id,
            form.classroom.id
          );
        } else if (area.name.toLowerCase().includes('formación')) {
          assessmentValue = await this.formationAreaService.calculateAverageItem(
            description,
            area.id,
            form.classroom.id
          );
        }

        const assessment = this.assessmentRepository.create({
          description,
          assessment: assessmentValue,
          conclusions: '',
          area,
          form,
        });
        const savedAssessment = await this.assessmentRepository.save(assessment);
        createdAssessments.push(savedAssessment);
      }
    }

    return createdAssessments;
  }

  async findAll(): Promise<Assessment[]> {
    return await this.assessmentRepository.find({
      relations: ['requeriments'],
      order: { id: 'ASC' },
    });
  }

  async findByForm(formId: number): Promise<Assessment[]> {
    const form = await this.formService.findOne(formId);

    if (!form) {
      throw new NotFoundException(`Formulario con ID ${formId} no encontrado`);
    }

    const assessments = await this.assessmentRepository.find({
      where: { form: { id: formId } },
      relations: ['form', 'requeriments'],
      order: { id: 'ASC' },
    });

    return assessments;
  }

  async findOne(id: number): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
      relations: ['requeriments'],
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID "${id}" not found`);
    }

    return assessment;
  }

  async update(id: number, updateAssessment: UpdateAssessmentDto, files?: Express.Multer.File[]): Promise<Assessment> {
    const assessment = await this.assessmentRepository.preload({
      id: id,
      ...updateAssessment,
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID "${id}" not found`);
    }

    if (updateAssessment.deletedRequirements) {
      for (const reqId of updateAssessment.deletedRequirements) {
        await this.requerimentService.remove(reqId); // Lógica de eliminación
      }
    }

    if (files && files.length > 0) {
      const existingRequeriments = await this.requerimentService.findByAssessment(id);
      const existingRequerimentsMap = new Map(
        existingRequeriments.map((req) => [req.name, req]),
      );

      for (const file of files) {
        const { originalname } = file;

        const existingRequeriment = existingRequerimentsMap.get(originalname);
        if (existingRequeriment) {
          await this.requerimentService.update(
            existingRequeriment.id,
            {
              name: originalname,
              assessmentId: id,
            },
            file,
          );
          existingRequerimentsMap.delete(originalname);
        } else {
          await this.requerimentService.create(
            {
              name: originalname,
              assessmentId: id,
            },
            file,
          );
        }
      }

      if (updateAssessment.deletedRequirements) {
        for (const reqId of updateAssessment.deletedRequirements) {
          await this.requerimentService.remove(reqId);
        }
      }
    }

    await this.assessmentRepository.save(assessment);

    const assessmentWithRequeriments = await this.assessmentRepository.findOne({
      where: { id },
      relations: ['requeriments'],
    });

    return assessmentWithRequeriments;
  }

  async remove(id: number) {
    const assessment = await this.findOne(id);

    return await this.assessmentRepository.remove(assessment);
  }

  async getAverageByAreaAndForm(areaId: number, formId: number): Promise<number> {
    const assessments = await this.assessmentRepository.find({
      where: {
        area: { id: areaId },
        form: { id: formId },
      },
    });

    if (assessments.length === 0) {
      return 0;
    }

    const total = assessments.reduce((sum, assessment) => {
      return sum + Number(assessment.assessment);
    }, 0);

    return Number((total / assessments.length).toFixed(2));
  }

  async getCalculationsByArea(areaName: string, formId: number): Promise<{ description: string; assessment: number }[]> {
    const form = await this.formService.findOne(formId);
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found.`);
    }
  
    const area = await this.areaService.findByName(areaName);
    if (!area) {
      throw new NotFoundException(`Area with name ${areaName} not found.`);
    }
  
    const items = areaAssessmentItems[areaName];
    if (!items) {
      throw new NotFoundException(`No items configured for area ${areaName}.`);
    }
  
    const results: { description: string; assessment: number }[] = [];
  
    for (const description of items) {
      let assessmentValue = 0;
  
      if (area.name.toLowerCase().includes('técnico')) {
        assessmentValue = await this.technicalAreaService.calculateAverageItem(
          description,
          area.id,
          form.classroom.id,
        );
      } else if (area.name.toLowerCase().includes('gráfico')) {
        assessmentValue = await this.graphicAreaService.calculateAverageItem(
          description,
          area.id,
          form.classroom.id,
        );
      } else if (area.name.toLowerCase().includes('formación')) {
        assessmentValue = await this.formationAreaService.calculateAverageItem(
          description,
          area.id,
          form.classroom.id,
        );
      }
  
      results.push({ description, assessment: assessmentValue });
    }
  
    return results;
  }  
}

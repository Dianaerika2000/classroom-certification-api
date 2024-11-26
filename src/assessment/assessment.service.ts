import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { Repository } from 'typeorm';
import { AreaService } from 'src/area/area.service';
import { FormService } from 'src/form/form.service';
import { areaAssessmentItems } from './config/assessment.constants';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CreateRequerimentDto } from './dto/create-requeriment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { UpdateRequerimentDto } from './dto/update-requeriment.dto';
import { RequerimentService } from './requeriment.service';

@Injectable()
export class AssessmentService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        private readonly areaService: AreaService,
        private readonly formService: FormService,
        private readonly requerimentService: RequerimentService
    ) { }

    async create(createAssessmentDto: CreateAssessmentDto): Promise<Assessment> {
        const { formId, areaId, requeriments, ...assessmentData } = createAssessmentDto;

        const form = await this.formService.findOne(formId);
        const area = await this.areaService.findOne(areaId);

        const assessment = this.assessmentRepository.create({
            ...assessmentData,
            form,
            area
        });

        const savedAssessment = await this.assessmentRepository.save(assessment);

        if (requeriments && requeriments.length > 0) {
            for (const req of requeriments) {
                const createRequerimentDto: CreateRequerimentDto = {
                    name: req.name,
                    url: req.url,
                    assessmentId: savedAssessment.id,
                };

                await this.requerimentService.create(createRequerimentDto);
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

        const form = await this.formService.findOne(formId);
        if (!form) {
            throw new NotFoundException(`Form with ID ${formId} not found.`);
        }

        for (const [areaName, items] of Object.entries(areaAssessmentItems)) {
            const area = await this.areaService.findByName(areaName);
            if (!area) {
                throw new NotFoundException(`Area with name ${areaName} not found.`);
            }

            for (const description of items) {
                const assessment = this.assessmentRepository.create({
                    description,
                    assessment: 0,
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
        });

        return assessments;
    }

    async findOne(id: number): Promise<Assessment> {
        const assessment = await this.assessmentRepository.findOne({
            where: { id },
            relations: ['requeriments'], // Incluimos los requeriments
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment with ID "${id}" not found`);
        }

        return assessment;
    }

    async update(id: number, updateAssessment: UpdateAssessmentDto): Promise<Assessment> {
        const assessment = await this.assessmentRepository.preload({
            id: id,
            ...updateAssessment,
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment with ID "${id}" not found`);
        }

        if (updateAssessment.requeriments && updateAssessment.requeriments.length > 0) {
            const existingRequeriments = await this.requerimentService.findByAssessment(id);
            const requerimentsMap = new Map(updateAssessment.requeriments.map(req => [req.name, req]));

            for (const existingRequeriment of existingRequeriments) {
                const updatedRequerimentData = requerimentsMap.get(existingRequeriment.name);

                if (updatedRequerimentData) {
                    const updateRequerimentDto: UpdateRequerimentDto = {
                        name: updatedRequerimentData.name,
                        url: updatedRequerimentData.url,
                        assessmentId: id
                    };
                    await this.requerimentService.update(existingRequeriment.id, updateRequerimentDto);
                    requerimentsMap.delete(existingRequeriment.name)
                } else {
                    await this.requerimentService.remove(existingRequeriment.id);
                }
            }

            for (const newRequerimentData of requerimentsMap.values()) {
                const createRequerimentDto: CreateRequerimentDto = {
                    name: newRequerimentData.name,
                    url: newRequerimentData.url,
                    assessmentId: newRequerimentData.assessmentId
                };
                await this.requerimentService.create(createRequerimentDto);
            }
        } else {
            await this.requerimentService.removeByAssessment(id);
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { Repository } from 'typeorm';
import { AreaService } from 'src/area/area.service';
import { FormService } from 'src/form/form.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { areaAssessmentItems } from './config/assessment.constants';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { RequerimentService } from './requeriment.service';
import { CreateRequerimentDto } from './dto/create-requeriment.dto';
import { UpdateRequerimentDto } from './dto/update-requeriment.dto';

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
        const { formId, areaId, requerimentName, requerimentUrl, ...assessmentData } = createAssessmentDto;

        const form = await this.formService.findOne(formId);
        const area = await this.areaService.findOne(areaId);

        const assessment = this.assessmentRepository.create({
            ...assessmentData,
            form,
            area
        });

        const savedAssessment = await this.assessmentRepository.save(assessment);
        console.log('savedAssessment', savedAssessment)

        const createRequerimentDto: CreateRequerimentDto = {
            name: requerimentName,
            url: requerimentUrl,
            assessmentId: savedAssessment.id,
        };
        console.log('createRequerimentDto', createRequerimentDto)

        await this.requerimentService.create(createRequerimentDto);

        const assessmentWithRequeriments = await this.assessmentRepository.findOne({
            where: { id: savedAssessment.id },
            relations: ['requeriments'],
        });

        return assessmentWithRequeriments;
    }

    async createByForm(createAssessmentDto: CreateAssessmentDto): Promise<Assessment[]> {
        const { formId } = createAssessmentDto;
        console.log('formId', formId)
        const createdAssessments: Assessment[] = [];

        const form = await this.formService.findOne(formId);
        if (!form) {
            throw new NotFoundException(`Form with ID ${formId} not found.`);
        }

        for (const [areaId, items] of Object.entries(areaAssessmentItems)) {
            const area = await this.areaService.findOne(+areaId);
            if (!area) {
                throw new NotFoundException(`Area with ID ${areaId} not found.`);
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
            relations: ['form'],
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

        if (updateAssessment.requerimentName || updateAssessment.requerimentUrl) {
            const requeriments = await this.requerimentService.findByAssessment(id);

            if (requeriments && requeriments.length > 0) {
                const requeriment = requeriments[0];
                const updateRequerimentDto: UpdateRequerimentDto = {
                    name: updateAssessment.requerimentName,
                    url: updateAssessment.requerimentUrl,
                    assessmentId: id,
                };

                await this.requerimentService.update(requeriment.id, updateRequerimentDto);
            } else {
                const createRequerimentDto = new CreateRequerimentDto();
                createRequerimentDto.name = updateAssessment.requerimentName;
                createRequerimentDto.url = updateAssessment.requerimentUrl;
                createRequerimentDto.assessmentId = id;

                await this.requerimentService.create(createRequerimentDto); // Creación del nuevo requerimiento
            }
        }

        await this.assessmentRepository.save(assessment);

        // Recuperar el Assessment con sus Requeriments para devolverlo completo
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ClassroomService } from '../classroom/classroom.service';
import { CertificationService } from '../certification/certification.service';
import { ClassroomStatus } from '../classroom/enums/classroom-status.enum';

@Injectable()
export class FormService {
    constructor(
        @InjectRepository(Form)
        private formRepository: Repository<Form>,
        private readonly classroomService: ClassroomService,
        private readonly certificationService: CertificationService,
    ) { }

    async create(createFormDto: CreateFormDto): Promise<Form> {
        const { classroomId, ...formData } = createFormDto;

        const classroom = await this.classroomService.findOne(classroomId);

        const form = this.formRepository.create({
            ...formData,
            finalGrade: formData.finalGrade ?? 0,
            classroom,
            completionDate: new Date(),
            lastRevisionDate: new Date(),
        });

        return await this.formRepository.save(form);
    }

    async findAll(): Promise<Form[]> {
        return await this.formRepository.find();
    }

    async findByClassroom(classroomId: number): Promise<Form[]> {
        const classroom = await this.classroomService.findOne(classroomId);

        if (!classroom) {
            throw new NotFoundException(`Aula con ID ${classroomId} no encontrada`);
        }

        const forms = await this.formRepository.find({
            where: { classroom: { id: classroomId } },
            relations: ['classroom'],
        });

        return forms;
    }

    async findOne(id: number): Promise<Form> {
        const form = await this.formRepository.findOne({
            where: { id },
            relations: ['classroom'], 
        });

        if (!form) {
            throw new NotFoundException(`Form with ID "${id}" not found`);
        }

        return form;
    }

    async update(id: number, updateFormDto: UpdateFormDto): Promise<Form> {
        const form = await this.formRepository.preload({
            id: id,
            ...updateFormDto,
        });

        if (!form) {
            throw new NotFoundException(`Form with ID "${id}" not found`);
        }

        return await this.formRepository.save(form);
    }

    async remove(id: number) {
        const form = await this.formRepository.findOne({
            where: { id },
            relations: ['classroom', 'classroom.certification'],
        });

        if (!form) {
            throw new NotFoundException(`Form with ID "${id}" not found`);
        }

        const classroom = form.classroom;
        if (!classroom) {
            throw new NotFoundException(`Classroom asociado al formulario no encontrado`);
        }

        if (classroom.certification) {
            await this.certificationService.remove(classroom.certification.id);
        }

        await this.classroomService.update(classroom.id, { status: ClassroomStatus.EVALUADA });

        return await this.formRepository.remove(form);
    }
}

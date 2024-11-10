import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { Repository } from 'typeorm';
import { ClassroomService } from 'src/classroom/classroom.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormService {
    constructor(
        @InjectRepository(Form)
        private formRepository: Repository<Form>,
        private readonly classroomService: ClassroomService,
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
        const form = await this.formRepository.findOneBy({ id });
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
        const form = await this.findOne(id);

        return await this.formRepository.remove(form);
    }
}

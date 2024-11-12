import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomService } from 'src/classroom/classroom.service';
import { Requeriment } from './entities/requeriment.entity';
import { CreateRequerimentDto } from './dto/create-requeriment.dto';
import { Assessment } from './entities/assessment.entity';
import { UpdateRequerimentDto } from './dto/update-requeriment.dto';
import { AssessmentService } from './assessment.service';

@Injectable()
export class RequerimentService {
    constructor(
        @InjectRepository(Requeriment)
        private requerimentRepository: Repository<Requeriment>,
    ) { }

    async create(createRequerimentDto: CreateRequerimentDto): Promise<Requeriment> {
        const { assessmentId, ...requerimentData } = createRequerimentDto;

        const requeriment = this.requerimentRepository.create({
            ...requerimentData,
            assessment: { id: assessmentId } 
        });

        return await this.requerimentRepository.save(requeriment);
    }

    async findAll(): Promise<Requeriment[]> {
        return await this.requerimentRepository.find();
    }

    async findByAssessment(assessmentId: number): Promise<Requeriment[]> {
        const requeriments = await this.requerimentRepository.find({
            where: { assessment: { id: assessmentId } },
            relations: ['assessment'],
        });

        return requeriments;
    }

    async findOne(id: number): Promise<Requeriment> {
        const requeriment = await this.requerimentRepository.findOneBy({ id });
        if (!requeriment) {
            throw new NotFoundException(`Requeriment with ID "${id}" not found`);
        }

        return requeriment;
    }

    async update(id: number, updateRequerimentDto: UpdateRequerimentDto): Promise<Requeriment> {
        const requeriment = await this.requerimentRepository.preload({
            id: id,
            ...updateRequerimentDto,
        });

        if (!requeriment) {
            throw new NotFoundException(`Requeriment with ID "${id}" not found`);
        }

        return await this.requerimentRepository.save(requeriment);
    }

    async remove(id: number) {
        const requeriment = await this.findOne(id);

        return await this.requerimentRepository.remove(requeriment);
    }

    async removeByAssessment(assessmentId: number) {
        const requeriments = await this.requerimentRepository.find({
            where: { assessment: { id: assessmentId } },
            relations: ['assessment'],
        });

        return await this.requerimentRepository.remove(requeriments);
    }
}

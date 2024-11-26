import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requeriment } from './entities/requeriment.entity';
import { CreateRequerimentDto } from './dto/create-requeriment.dto';
import { UpdateRequerimentDto } from './dto/update-requeriment.dto';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class RequerimentService {
  constructor(
    @InjectRepository(Requeriment)
    private requerimentRepository: Repository<Requeriment>,
    private readonly awsService: AwsService,
  ) {}

  async create(createRequerimentDto: CreateRequerimentDto, file?: Express.Multer.File): Promise<Requeriment> {
    const { assessmentId, ...requerimentData } = createRequerimentDto;

    let url: string | undefined;

    if (file) {
      const { buffer, originalname, mimetype } = file;

      const uploadResult = await this.awsService.uploadFileToS3(
        buffer,
        `${assessmentId}_${originalname}`,
        mimetype,
      );
      url = uploadResult;
    }

    const requeriment = this.requerimentRepository.create({
      ...requerimentData,
      url,
      assessment: { id: assessmentId },
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

  async update(id: number, updateRequerimentDto: UpdateRequerimentDto, file?: Express.Multer.File): Promise<Requeriment> {
    const { assessmentId, ...requerimentData } = updateRequerimentDto;

    const requeriment = await this.requerimentRepository.preload({
      id: id,
      ...requerimentData,
    });

    if (!requeriment) {
      throw new NotFoundException(`Requeriment with ID "${id}" not found`);
    }

    if (file) {
      const { buffer, originalname, mimetype } = file;
  
      const uploadResult = await this.awsService.uploadFileToS3(
        buffer,
        `${assessmentId}_${originalname}`,
        mimetype,
      );
      requeriment.url = uploadResult
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

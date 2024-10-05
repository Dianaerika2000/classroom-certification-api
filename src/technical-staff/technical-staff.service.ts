import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechnicalStaffDto } from './dto/create-technical-staff.dto';
import { UpdateTechnicalStaffDto } from './dto/update-technical-staff.dto';
import { Repository } from 'typeorm';
import { Personal } from './entities/personal';
import { AwsService } from '../aws/aws.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TechnicalStaffService {
  constructor(
    @InjectRepository(Personal)
    private readonly personalRepository: Repository<Personal>,
    private readonly awsService: AwsService,
  ){}
  
  async create(createTechnicalStaffDto: CreateTechnicalStaffDto, signature: Express.Multer.File) {
    const { name, position } = createTechnicalStaffDto;
    const { photoUrl } = await this.awsService.uploadImageToS3(signature.buffer, signature.originalname);
    
    if (!photoUrl) {
      throw new BadRequestException('Failed to upload signature image to S3');
    }

    const technicalStaff = this.personalRepository.create({
      name,
      position,
      signature: photoUrl,
    });

    await this.personalRepository.save(technicalStaff);

    return technicalStaff;
  }

  async findAll() {
    return await this.personalRepository.find();
  }

  async findOne(id: number) {
    const technicalStaff = await this.personalRepository.findOneBy({ id });
    
    if (!technicalStaff) {
      throw new NotFoundException(`Technical staff with id ${id} not found`);
    }

    return technicalStaff;
  }

  async update(id: number, updateTechnicalStaffDto: UpdateTechnicalStaffDto, signature?: Express.Multer.File) {
    const technicalStaff = await this.findOne(id);
    
    const { name, position } = updateTechnicalStaffDto;
    technicalStaff.name = name ?? technicalStaff.name;
    technicalStaff.position = position ?? technicalStaff.position;

    if (signature) {
      const { photoUrl } = await this.awsService.uploadImageToS3(signature.buffer, signature.originalname);

      if (!photoUrl) {
        throw new BadRequestException('Failed to upload signature image to S3');
      }

      technicalStaff.signature = photoUrl;
    }

    return this.personalRepository.save(technicalStaff);
  }

  async remove(id: number) {
    const technicalStaff = await this.findOne(id);

    return await this.personalRepository.remove(technicalStaff);
  }
}

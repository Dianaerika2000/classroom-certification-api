import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechnicalStaffDto } from './dto/create-technical-staff.dto';
import { UpdateTechnicalStaffDto } from './dto/update-technical-staff.dto';
import { In, Repository } from 'typeorm';
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
  
  async create(createTechnicalStaffDto: CreateTechnicalStaffDto) {
    const { name, position } = createTechnicalStaffDto;

    const technicalStaff = this.personalRepository.create({
      name,
      position,
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

  async update(id: number, updateTechnicalStaffDto: UpdateTechnicalStaffDto) {
    const technicalStaff = await this.findOne(id);
    
    const { name, position } = updateTechnicalStaffDto;
    technicalStaff.name = name ?? technicalStaff.name;
    technicalStaff.position = position ?? technicalStaff.position;

    return this.personalRepository.save(technicalStaff);
  }

  async remove(id: number) {
    const technicalStaff = await this.findOne(id);

    return await this.personalRepository.remove(technicalStaff);
  }

  async findPersonalEntities(personalIds: number[]): Promise<Personal[]> {
    const personalEntities = await this.personalRepository.findBy({
      id: In(personalIds)
    });

    if (personalEntities.length !== personalIds.length) {
      const foundIds = personalEntities.map(p => p.id);
      const missingIds = personalIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Personal with IDs ${missingIds.join(', ')} not found`);
    }

    return personalEntities;
  }
}

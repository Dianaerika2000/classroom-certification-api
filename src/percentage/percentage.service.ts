import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePercentageDto } from './dto/create-percentage.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { Percentage } from './entities/percentage.entity';
import { AreaService } from '../area/area.service';
import { CycleService } from '../cycle/cycle.service';

@Injectable()
export class PercentageService {
  constructor(
    @InjectRepository(Percentage)
    private readonly percentageRepository: Repository<Percentage>,
    private readonly areaService: AreaService,
    private readonly cycleService: CycleService,
  ){}

  async create(createPercentageDto: CreatePercentageDto): Promise<Percentage> {
    const { areaId, cycleId, percentage } = createPercentageDto;

    await this.validatePercentageSum(areaId, percentage);

    const area = await this.areaService.findOne(areaId);
    const cycle = await this.cycleService.findOne(cycleId);

    const newPercentage = this.percentageRepository.create({
      percentage,
      area,
      cycle,
    });

    return await this.percentageRepository.save(newPercentage);
  }

  async findAll(): Promise<Percentage[]>{
    return await this.percentageRepository.find();
  }

  async findOne(id: number) {
    const percentage = await this.percentageRepository.findOneBy({ id });
    
    if (!percentage) {
      throw new NotFoundException(`Percentage with ID ${id} not found`);
    }

    return percentage;
  }

  async update(id: number, updatePercentageDto: UpdatePercentageDto): Promise<Percentage> {
    const { areaId, cycleId, percentage } = updatePercentageDto;
    
    const percentageEntity = await this.percentageRepository.preload({
      id: id,
      percentage
    });

    if (!percentageEntity) throw new NotFoundException(`Percentage with ID ${id} not found`);

    await this.validatePercentageSum(areaId || percentageEntity.area.id, percentage, id);

    if (areaId) {
      percentageEntity.area = await this.areaService.findOne(areaId);
    }

    if (cycleId) {
      percentageEntity.cycle = await this.cycleService.findOne(cycleId);
    }

    return await this.percentageRepository.save(percentageEntity);
  }

  async remove(id: number) {
    const percentage = await this.findOne(id);
    
    return await this.percentageRepository.remove(percentage);
  }

  private async validatePercentageSum(areaId: number, newPercentage: number, excludedPercentageId?: number): Promise<void> {
    const area = await this.areaService.findOne(areaId);

    const existingPercentages = await this.percentageRepository.find({ where: { area } });

    // Sumar los porcentajes, excluyendo el que se está actualizando (si es el caso)
    const totalPercentage = existingPercentages.reduce((total, currentPercentage) => {
      if (excludedPercentageId && currentPercentage.id === excludedPercentageId) {
        return total; 
      }
      return total + currentPercentage.percentage;
    }, 0);

    if (totalPercentage + newPercentage > 100) {
      throw new BadRequestException(
        `The total percentage for area ${area.name} exceeds 100%. Current total: ${totalPercentage}.`
      );
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cycle } from './entities/cycle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CycleService {
  constructor(
    @InjectRepository(Cycle)
    private readonly cycleRepository: Repository<Cycle>
  ){}
  async create(createCycleDto: CreateCycleDto) {
    const { name } = createCycleDto;
    const cycle = this.cycleRepository.create({
      name
    });

    return await this.cycleRepository.save(cycle);
  }

  async findAll() {
    return await this.cycleRepository.find();
  }

  async findOne(id: number) {
    const cycle = await this.cycleRepository.findOneBy({ id });

    if (!cycle) {
      throw new NotFoundException(`Cycle with id ${id} not found`);
    }
    
    return cycle;
  }

  async update(id: number, updateCycleDto: UpdateCycleDto) {
    const cycle = await this.findOne(id);
    const { name } = updateCycleDto;
    cycle.name = name;

    return await this.cycleRepository.save(cycle);
  }

  async remove(id: number) {
    const cycle = await this.findOne(id);

    return await this.cycleRepository.remove(cycle);
  }

  async findByName(name: string): Promise<Cycle> {
    return await this.cycleRepository.findOne({ where: {name} });
  }
}

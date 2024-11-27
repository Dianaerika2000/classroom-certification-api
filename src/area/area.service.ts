import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>
  ){}

  async create(createAreaDto: CreateAreaDto) {
    const { name } = createAreaDto;
    const area = this.areaRepository.create({
      name
    })

    return await this.areaRepository.save(area);
  }

  async findAll() {
    return await this.areaRepository.find();
  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOneBy({ id });

    if (!area) {
      throw new NotFoundException(`Area with id ${id} not found`);
    }

    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.findOne(id);
    const { name } = updateAreaDto;
    area.name = name;

    return await this.areaRepository.save(area);
  }

  async remove(id: number) {
    const area = await this.findOne(id);

    return await this.areaRepository.remove(area);
  }

  async findByName(name: string): Promise<Area> {
    const area = await this.areaRepository
      .createQueryBuilder('area')
      .where('LOWER(area.name) = :name', { name: name.toLowerCase() })
      .getOne();
  
    if (!area) {
      throw new NotFoundException(`Area with name "${name}" not found`);
    }
  
    return area;
  }  
}

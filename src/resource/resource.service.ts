import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CycleService } from '../cycle/cycle.service';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly cycleService: CycleService,
  ) { }

  async create(createResourceDto: CreateResourceDto) {
    const { name, cycleId } = createResourceDto;
    const cycle = await this.cycleService.findOne(cycleId);

    const resource = this.resourceRepository.create({
      name,
      cycle
    });

    return await this.resourceRepository.save(resource);
  }

  async findAll() {
    return await this.resourceRepository.find();
  }

  async findAllByCycle(cycleId: number) {
    const cycle = await this.cycleService.findOne(cycleId);

    if (!cycle) {
      throw new NotFoundException(`Cycle with id ${cycleId} not found`);
    }

    return await this.resourceRepository.find({
      where: { cycle: { id: cycleId } }
    });
  }

  async findOne(id: number) {
    const resource = await this.resourceRepository.findOneBy({ id });

    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`)
    }

    return resource;
  }

  async update(id: number, updateResourceDto: UpdateResourceDto) {
    const { cycleId, ...resourceData } = updateResourceDto;
    const cycle = await this.cycleService.findOne(cycleId);

    const resource = await this.resourceRepository.preload({
      id: id,
      ...resourceData,
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    resource.cycle = cycle;

    return await this.resourceRepository.save(resource);
  }

  async remove(id: number) {
    const resource = await this.findOne(id);

    return await this.resourceRepository.remove(resource);
  }

  async findContents(resourceId: number) {
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
      relations: ['contents'],
    });

    if (!resource) {
      throw new NotFoundException(`Resource with id ${resourceId} not found`);
    }

    return resource.contents;
  }

  async findByName(name: string): Promise<Resource> {
    return await this.resourceRepository.findOne({ where: { name } });
  }
}

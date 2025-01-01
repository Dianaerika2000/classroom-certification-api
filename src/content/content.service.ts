import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Repository } from 'typeorm';
import { ResourceService } from '../resource/resource.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly resourceService: ResourceService
  ) { }

  async create(createContentDto: CreateContentDto) {
    const { name, resourceId } = createContentDto;
    const resource = await this.resourceService.findOne(resourceId);

    const content = this.contentRepository.create({
      name,
      resource
    });

    return await this.contentRepository.save(content);
  }

  async findAll() {
    return await this.contentRepository.find();
  }

  async findAllByResource(resourceId: number) {
    const cycle = await this.resourceService.findOne(resourceId);

    if (!cycle) {
      throw new NotFoundException(`Resource with id ${resourceId} not found`);
    }

    return await this.contentRepository.find({
      where: { resource: { id: resourceId } }
    });
  }

  async findOne(id: number) {
    const content = await this.contentRepository.findOneBy({ id });

    if (!content) {
      throw new NotFoundException(`Content with id ${id} not found`)
    }

    return content;
  }

  async update(id: number, updateContentDto: UpdateContentDto) {
    const { resourceId, ...contentData } = updateContentDto;
    const resource = await this.resourceService.findOne(resourceId);

    const content = await this.contentRepository.preload({
      id: id,
      ...contentData
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    content.resource = resource;

    return await this.contentRepository.save(content);
  }

  async remove(id: number) {
    const content = await this.findOne(id);

    return await this.contentRepository.remove(content);
  }

  async findByName(name: string): Promise<Content> {
    return await this.contentRepository.findOne({ where: { name } });
  }
}

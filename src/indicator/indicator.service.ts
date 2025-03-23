import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Indicator } from './entities/indicator.entity';
import { Repository } from 'typeorm';
import { AreaService } from 'src/area/area.service';
import { ResourceService } from 'src/resource/resource.service';
import { ContentService } from 'src/content/content.service';

@Injectable()
export class IndicatorService {
  constructor(
    @InjectRepository(Indicator)
    private readonly indicatorRepository: Repository<Indicator>,
    private readonly areaService: AreaService,
    private readonly resourceService: ResourceService,
    private readonly contentService: ContentService,
  ){}

  async create(createIndicatorDto: CreateIndicatorDto): Promise<Indicator> {
    const { areaId, resourceId, contentId, ...indicatorData } = createIndicatorDto;

    const area = await this.areaService.findOne(areaId);
    const resource = await this.resourceService.findOne(resourceId);

    let content = null;
    if (contentId) {
      content = await this.contentService.findOne(contentId);
    }

    const indicator = this.indicatorRepository.create({
      ...indicatorData,
      area,
      resource,
      content,
    });

    return await this.indicatorRepository.save(indicator);
  }

  async findAll(): Promise<Indicator[]> {
    return await this.indicatorRepository.find();
  }

  async findOne(id: number): Promise<Indicator> {
    const indicator = await this.indicatorRepository.findOneBy({ id });
    if (!indicator) {
      throw new NotFoundException(`Indicator with ID "${id}" not found`);
    }

    return indicator;
  }

  async update(id: number, updateIndicatorDto: UpdateIndicatorDto): Promise<Indicator> {
    const { areaId, resourceId, contentId, ...indicatorData } = updateIndicatorDto;

    const indicator = await this.indicatorRepository.preload({
      id: id,
      ...indicatorData
    });

    if (!indicator) {
      throw new NotFoundException(`Indicator with ID ${id} not found`);
    }

    if (areaId) {
      indicator.area = await this.areaService.findOne(areaId);
    }

    if (resourceId) {
      indicator.resource = await this.resourceService.findOne(resourceId);
    }

    if (contentId !== undefined) {
      indicator.content = contentId === null ? null : await this.contentService.findOne(contentId);
    }

    return this.indicatorRepository.save(indicator);
  }

  async remove(id: number) {
    const indicator = await this.findOne(id);
    return await this.indicatorRepository.remove(indicator);
  }

  async findAllByArea(areaId: number) {
    const area = await this.areaService.findOne(areaId);

    if (!area) {
      throw new NotFoundException(`Area with id ${areaId} not found`);
    }

    return await this.indicatorRepository.find({
      where: { area: { id: areaId } }
    });
  }

  async findByAreaAndResource(areaId: number, resourceId: number): Promise<Indicator[]> {
    const area = await this.areaService.findOne(areaId);
    if (!area) {
      throw new NotFoundException(`Area with id ${areaId} not found`);
    }

    const resource = await this.resourceService.findOne(resourceId);
    if (!resource) {
      throw new NotFoundException(`Content with id ${resourceId} not found`);
    }
  
    return await this.indicatorRepository.find({
      where: {
        area: { id: areaId },
        resource: { id: resourceId },
      },
    });
  }
  
  async findByAreaAndContent(areaId: number, contentId: number): Promise<Indicator[]> {
    const area = await this.areaService.findOne(areaId);
    if (!area) {
      throw new NotFoundException(`Area with id ${areaId} not found`);
    }

    const content = await this.contentService.findOne(contentId);
    if (!content) {
      throw new NotFoundException(`Content with id ${contentId} not found`);
    }
  
    return await this.indicatorRepository.find({
      where: {
        area: { id: areaId },
        content: { id: contentId },
      },
    });
  }  
}

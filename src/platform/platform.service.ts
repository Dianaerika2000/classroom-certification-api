import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { Platform } from './entities/platform.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    private readonly configService: ConfigService,
  ){}

  async create(createPlatformDto: CreatePlatformDto) {
    const { url } = createPlatformDto;
    
    const existingPlatform = await this.platformRepository.findOneBy({ url });
    if (existingPlatform) {
      throw new BadRequestException('A platform with this URL already exists.');
    }

    const newPlatform = this.platformRepository.create(createPlatformDto);

    return await this.platformRepository.save(newPlatform);
  }

  async findAll(): Promise<Platform[]> {
    return await this.platformRepository.find();
  }

  async findOne(id: number): Promise<Platform> {
    const platform = await this.platformRepository.findOneBy({ id });
    if (!platform) {
      throw new NotFoundException(`Platform with ID "${id}" not found`);
    }

    return platform;
  }

  async setPlatformEnvironmentVariables(id: number): Promise<void> {
    const platform = await this.findOne(id);

    const authUrl = `${platform.url}/login/token.php`;
    const apiUrl = `${platform.url}/webservice/rest/server.php`;
    const token = platform.token;

    this.configService.set('MOODLE_AUTH_URL', authUrl);
    this.configService.set('MOODLE_API_URL', apiUrl);
    this.configService.set('MOODLE_SERVICE', 'moodle_customized');
    this.configService.set('MOODLE_TOKEN', token);
  }

  async findOneByUrl(url: string): Promise<Platform | null> {
    return await this.platformRepository.findOneBy({ url });
  }  
}

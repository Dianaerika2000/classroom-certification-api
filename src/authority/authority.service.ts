import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuthorityDto } from './dto/create-authority.dto';
import { UpdateAuthorityDto } from './dto/update-authority.dto';
import { Authority } from './entities/authority.entity';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class AuthorityService {
  constructor(
    @InjectRepository(Authority)
    private readonly authorityRepository: Repository<Authority>,
    private readonly awsService: AwsService,
  ){}
  async create(createAuthorityDto: CreateAuthorityDto, signature: Express.Multer.File) {
    const { name, position } = createAuthorityDto;
    
    const { photoUrl } = await this.awsService.uploadImageToS3(signature.buffer, signature.originalname);
    if (!photoUrl) {
      throw new BadRequestException('Failed to upload signature image to S3');
    }

    const authority = this.authorityRepository.create({
      name,
      position,
      signature: photoUrl
    });

    return await this.authorityRepository.save(authority);
  }

  async findAll() {
    return await this.authorityRepository.find();
  }

  async findOne(id: number) {
    const authority = await this.authorityRepository.findOneBy({ id });

    if (!authority) {
      throw new NotFoundException(`Authority with id ${id} not found`);
    }

    return authority;
  }

  async update(id: number, updateAuthorityDto: UpdateAuthorityDto, signature?: Express.Multer.File) {
    const authority = await this.authorityRepository.preload({
      id,
      ...updateAuthorityDto
    });

    if (!authority) {
      throw new NotFoundException(`Authority with id ${id} not found`);
    }

    if (signature && signature.buffer && signature.buffer.length > 0) {
      const { photoUrl } = await this.awsService.uploadImageToS3(signature.buffer, signature.originalname);
      authority.signature = photoUrl;
    }
  
    return await this.authorityRepository.save(authority);
  }

  async remove(id: number) {
    const authority = await this.findOne(id);
  
    return await this.authorityRepository.remove(authority);
  }
}

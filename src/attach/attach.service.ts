import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttachDto } from './dto/create-attach.dto';
import { UpdateAttachDto } from './dto/update-attach.dto';
import { Attach } from './entities/attach.entity';
import { MoodleService } from 'src/moodle/moodle.service';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class AttachService {
  constructor(
    @InjectRepository(Attach)
    private readonly attachRepository: Repository<Attach>,
    private readonly moodleService: MoodleService,
    private readonly awsService: AwsService
  ){}

  async create(createAttachDto: CreateAttachDto) {
    const { token, classroomId, courseId } = createAttachDto;

    const version = await this.getNextVersion(classroomId);

    const courseContents = await this.moodleService.getCourseContents(
      courseId, 
      token
    );

    const jsonContent = JSON.stringify(courseContents);
    const buffer = Buffer.from(jsonContent);

    const fileName = `course_${classroomId}_${version}.json`;

    const fileUrl = await this.awsService.uploadFileToS3(
      buffer, 
      fileName, 
      'application/json'
    );

    const attach = this.attachRepository.create({
      url: fileUrl,
      version,
      classroom: { id: classroomId }
    });

    return await this.attachRepository.save(attach);
  }

  async findAll() {
    return await this.attachRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findAllByClassroom(classroomId: number) {
    return await this.attachRepository.find({
      where: { 
        classroom: { id: classroomId } 
      },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number) {
    const attach = await this.attachRepository.findOne({ where: { id } });

    if (!attach) {
      throw new NotFoundException(`Attach with ID ${id} not found`);
    }

    return attach;
  }

  async remove(id: number) {
    const attach = await this.findOne(id);
    
    //TODO: Eliminar archivo de S3 
    return await this.attachRepository.remove(attach);
  }

  private async getNextVersion(classroomId: number): Promise<string> {
    const lastAttach = await this.attachRepository.findOne({
      where: { classroom: { id: classroomId } },
      order: { createdAt: 'DESC' }
    });

    if (!lastAttach) {
      return 'v1';
    }

    const currentVersionNumber = parseInt(lastAttach.version.replace('v', ''), 10);
    return `v${currentVersionNumber + 1}`;
  }
}

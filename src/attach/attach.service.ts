import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attach } from './entities/attach.entity';
import { CreateAttachDto } from './dto/create-attach.dto';
import { AttachType } from './enums/attach-type.enum';
import { MoodleService } from '../moodle/moodle.service';
import { AwsService } from '../aws/aws.service';
import { ClassroomService } from '../classroom/classroom.service';

@Injectable()
export class AttachService {
  constructor(
    @InjectRepository(Attach)
    private readonly attachRepository: Repository<Attach>,
    private readonly moodleService: MoodleService,
    private readonly awsService: AwsService,
    private readonly classroomService: ClassroomService
  ){}

  async create(createAttachDto: CreateAttachDto) {
    const { classroomId, type } = createAttachDto;
    const classroom = await this.classroomService.findOne(classroomId);
    const moodleCourseId = classroom.moodleCourseId;
    const platform = classroom.platform;
    
    const version = await this.getNextVersion(classroomId);

    const courseContents = await this.getCourseContentsByType(
      type,
      platform.url,
      platform.token,
      moodleCourseId
    );

    if (!courseContents || courseContents.length === 0) {
      throw new NotFoundException(`No se encontraron contenidos para el tipo ${type} en el curso con ID ${moodleCourseId}`);
    }

    const jsonContent = JSON.stringify(courseContents);
    const buffer = Buffer.from(jsonContent);
    const fileName = `${type}_course_${classroomId}_${version}.json`;

    const fileUrl = await this.awsService.uploadFileToS3(
      buffer, 
      fileName, 
      'application/json'
    );

    const attach = this.attachRepository.create({
      url: fileUrl,
      version,
      type,
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
        classroom: { id: classroomId },
        //type,
      },
      order: { createdAt: 'DESC' },
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

  private async getCourseContentsByType(
    type: AttachType,
    url: string,
    token: string,
    courseId: number
  ): Promise<any[]> {
    switch (type) {
      case AttachType.ASSIGN:
        return await this.getAssignmentsByCourse(url, token, courseId);
      case AttachType.FORUM:
        return await this.getForumsByCourse(url, token, courseId);
      case AttachType.GENERAL:
      default:
        return await this.moodleService.getCourseContents2(url, token, courseId);
    }
  }  

  private async getAssignmentsByCourse(url: string, token: string, courseId: number): Promise<any[]> {
    await this.moodleService.enrolUsers(courseId, token, url);
    const courseContents = await this.moodleService.getAssignmentsByCourse2(url, token, courseId);
    await this.moodleService.unenrolUsers(courseId, token, url);
  
    if (!courseContents || courseContents.length === 0) {
      throw new NotFoundException(`No se encontraron contenidos para el curso con ID ${courseId}`);
    }
  
    // const assignsBySection = courseContents.reduce((result, section) => {
    //   const sectionName = section.name || `Section ${section.id}`;
    //   const assigns = (section.modules || []).filter((module: any) => module.modname === 'assign');
  
    //   if (assigns.length > 0) {
    //     result.push({
    //       section: sectionName,
    //       assigns: assigns,
    //     });
    //   }
  
    //   return result;
    // }, []);
  
    return courseContents.courses[0].assignments;
  }

  private async getForumsByCourse(url: string, token: string, courseId: number): Promise<any[]> {
    const courseContents = await this.moodleService.getForumsByCourse2(url, token, courseId);
  
    if (!courseContents || courseContents.length === 0) {
      throw new NotFoundException(`No se encontraron contenidos para el curso con ID ${courseId}`);
    }
  
    // const forumsBySection = courseContents.reduce((result, section) => {
    //   const sectionName = section.name || `Section ${section.id}`;
    //   const forums = (section.modules || []).filter((module: any) => module.modname === 'forum');
  
    //   if (forums.length > 0) {
    //     result.push({
    //       section: sectionName,
    //       forums: forums,
    //     });
    //   }
  
    //   return result;
    // }, []);
  
    return courseContents;
  }  
}

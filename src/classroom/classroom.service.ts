import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { FindClassroomMoodleDto } from './dto/find-classroom-moodle.dto';
import { Classroom } from './entities/classroom.entity';
import { MoodleService } from '../moodle/moodle.service';
import { TeamService } from '../team/team.service';
import { PlatformService } from '../platform/platform.service';
import { Form } from '../form/entities/form.entity';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    private readonly moodleService: MoodleService,
    private readonly teamService: TeamService,
    private readonly platformService: PlatformService,
  ){}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const { teamId, platformId, ...classroomData } = createClassroomDto;
    
    const team = await this.teamService.findOne(teamId);
    const platform = await this.platformService.findOne(platformId);
    
    const classroom = this.classroomRepository.create({
      ...classroomData,
      team,
      platform,
    });
  
    return await this.classroomRepository.save(classroom);
  }

  async findAll(status?: string): Promise<Classroom[]> {
    const options: any = {
      relations: ['team', 'team.personals', 'platform'],
      order: { id: 'DESC' },
    };
  
    if (status) {
      options.where = { status };
    }
  
    return await this.classroomRepository.find(options);
  }  

  async findOne(id: number): Promise<Classroom> {
    const classroom = await this.classroomRepository.findOne({
      where: { id },
      relations: ['team', 'team.personals', 'platform'] 
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID "${id}" not found`);
    }

    return classroom;
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto): Promise<Classroom> {
    const preloadedClassroom = await this.classroomRepository.preload({
      id,
      ...updateClassroomDto,
    });
    
    if (!preloadedClassroom) {
      throw new NotFoundException(`Classroom with ID "${id}" not found`);
    }
    
    const { teamId, platformId } = updateClassroomDto;

    if (teamId) {
      const team = await this.teamService.findOne(teamId);
      preloadedClassroom.team = team;
    }

    if (platformId) {
      const platform = await this.platformService.findOne(platformId);
      preloadedClassroom.platform = platform;
    }

    return await this.classroomRepository.save(preloadedClassroom);
  }

  async remove(id: number) {
    const classroom = await this.findOne(id);

    return await this.classroomRepository.delete(classroom);
  }

  async findClassroomInMoodle(findClassroomMoodleDto: FindClassroomMoodleDto): Promise<any> {
    const { field, value, platformId} = findClassroomMoodleDto;
    
    const platform = await this.platformService.findOne(platformId);

    try {
      const courses = await this.moodleService.getCourses(
        platform.url,
        platform.token,
      );

      const matchingCourses = courses.filter((course: any) =>
        course[field]?.toLowerCase().includes(value.toLowerCase())
      );

      if (matchingCourses.length === 0) {
        throw new NotFoundException(`No se encontraron aulas en Moodle con ${field} = ${value}.`);
      }

      return matchingCourses;
    } catch (error) {
      throw new NotFoundException(`Error al buscar aulas en Moodle: ${error.message}`);
    }
  }

  async getLatestFormByClassroom(classroomId: number): Promise<Form> {
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId },
      relations: ['forms'],
    });
  
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found.`);
    }
  
    if (!classroom.forms || classroom.forms.length === 0) {
      throw new NotFoundException(
        `No forms found for Classroom with ID ${classroomId}.`,
      );
    }
  
    const latestForm = classroom.forms.sort(
      (a, b) => b.completionDate.getTime() - a.completionDate.getTime(),
    )[0];
  
    return latestForm;
  }    
}

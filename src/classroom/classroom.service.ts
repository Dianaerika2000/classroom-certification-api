import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { Classroom } from './entities/classroom.entity';
import { MoodleService } from '../moodle/moodle.service';
import { FindClassroomMoodleDto } from '../moodle/dto/find-classroom-moodle.dto';
import { TeamService } from '../team/team.service';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    private readonly moodleService: MoodleService,
    private readonly teamService: TeamService,
  ){}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const { teamId, ...classroomData } = createClassroomDto;
    const team = await this.teamService.findOne(teamId);
    
    const classroom = this.classroomRepository.create({
      ...classroomData,
      team
    });
  
    return await this.classroomRepository.save(classroom);
  }

  async findAll(status?: string): Promise<Classroom[]> {
    if (status) {
      return await this.classroomRepository.find({ 
        where: { status },
        relations: ['team', 'team.personals'] 
      });
    }
    
    return await this.classroomRepository.find({ 
      where: { status },
      relations: ['team', 'team.personals'] 
    });
  }

  async findOne(id: number): Promise<Classroom> {
    const classroom = await this.classroomRepository.findOne({
      where: { id },
      relations: ['team', 'team.personals'] 
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
    
    const { teamId } = updateClassroomDto;
    if (teamId) {
      const team = await this.teamService.findOne(teamId);
      preloadedClassroom.team = team;
    }

    return await this.classroomRepository.save(preloadedClassroom);
  }

  async remove(id: number) {
    const classroom = await this.findOne(id);

    return await this.classroomRepository.delete(classroom);
  }

  async findClassroomInMoodle(findClassroomMoodleDto: FindClassroomMoodleDto): Promise<any> {
    const { field, value } = findClassroomMoodleDto;
  
    try {
      const courses = await this.moodleService.getCourseByField(findClassroomMoodleDto);
      return courses;
    } catch (error) {
      throw new NotFoundException(`No se encontró el aula en Moodle con ${field} = ${value}`);
    }
  }
}

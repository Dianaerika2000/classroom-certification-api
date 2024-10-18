import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ){}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const classroom = this.classroomRepository.create(createClassroomDto);
    return await this.classroomRepository.save(classroom);
  }

  async findAll(status?: string): Promise<Classroom[]> {
    if (status) {
      return await this.classroomRepository.find({ where: { status } });
    }
    
    return await this.classroomRepository.find();
  }

  async findOne(id: number): Promise<Classroom> {
    const classroom = await this.classroomRepository.findOneBy({ id });
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID "${id}" not found`);
    }

    return classroom;
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto): Promise<Classroom> {
    const preloadedClassroom = await this.classroomRepository.preload({
      id: id,
      ...updateClassroomDto,
    });
    
    if (!preloadedClassroom) {
      throw new NotFoundException(`Classroom with ID "${id}" not found`);
    }
    
    return await this.classroomRepository.save(preloadedClassroom);
  }

  async remove(id: number) {
    const classroom = await this.findOne(id);

    return await this.classroomRepository.delete(classroom);
  }
}

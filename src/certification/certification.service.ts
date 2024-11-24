import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { ClassroomService } from '../classroom/classroom.service';
import { ClassroomStatus } from '../classroom/enums/classroom-status.enum';
import { ValidRoles } from '../common/enums/valid-roles';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CertificationService {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    private readonly classroomService: ClassroomService,
    private readonly teamService: TeamService,
    private readonly userService: UserService,
  ) {}

  async create(createCertificationDto: CreateCertificationDto, username: string) {
    const { classroomId, teamId, evaluatorUsername, ...otherAttributes } = createCertificationDto;

    const classroom = await this.classroomService.findOne(classroomId);

    if (classroom.status !== ClassroomStatus.EVALUADA) {
      throw new BadRequestException(
        `Classroom with ID ${classroomId} is not eligible for certification. Current status: ${classroom.status}`,
      );
    }

    await this.teamService.findOne(teamId);

    const evaluator = await this.determineEvaluatorName(
      username,
      evaluatorUsername,
    );

    const certification = this.certificationRepository.create({
      classroom,
      teamId,
      evaluatorName: evaluator,
      ...otherAttributes,
    });

    return this.certificationRepository.save(certification);
  }

  async findAll() {
    const certifications = await this.certificationRepository.find({
      relations: ['classroom'],
      order: {
        createdAt: 'DESC',
      },
    });

    return certifications;
  }

  async findOne(id: number) {
    const certification = await this.certificationRepository.findOne({
      where: { id },
      relations: ['classroom'],
    });

    if (!certification) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }

    return certification;
  }

  async findByClassroom(classroomId: number) {
    const certifications = await this.certificationRepository.find({
      where: {
        classroom: { id: classroomId },
      },
      relations: ['classroom'],
      order: {
        createdAt: 'DESC',
      },
    });

    return certifications;
  }

  async update(id: number, updateCertificationDto: UpdateCertificationDto, username: string) {
    const preloadedCertification = await this.certificationRepository.preload({
      id,
    });

    if (!preloadedCertification) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }

    const { evaluatorUsername, classroomId, teamId, ...updateData } = updateCertificationDto;

    if (classroomId) {
      const classroom = await this.classroomService.findOne(classroomId);
      if (classroom.status !== ClassroomStatus.EVALUADA) {
        throw new BadRequestException(
          `Classroom with ID ${classroomId} is not eligible for certification. Current status: ${classroom.status}`,
        );
      }
      preloadedCertification.classroom = classroom;
    }

    if (teamId) {
      await this.teamService.findOne(teamId);
      preloadedCertification.teamId = teamId;
    }

    if (evaluatorUsername !== undefined) {
      const validatedEvaluatorName = await this.determineEvaluatorName(
        username,
        evaluatorUsername,
      );
      preloadedCertification.evaluatorName = validatedEvaluatorName;
    }

    Object.assign(preloadedCertification, updateData);

    return this.certificationRepository.save(preloadedCertification);
  }

  async remove(id: number) {
    const certification = await this.findOne(id);
    
    return this.certificationRepository.remove(certification);
  }

  async determineEvaluatorName(username: string, evaluatorUsername: string | undefined ): Promise<string> {
    const loggedUser = await this.userService.findOneByUsername(username);

    if (loggedUser.rol.name === ValidRoles.evaluator) {
      return loggedUser.name;
    }

    if (loggedUser.rol && loggedUser.rol.name === ValidRoles.admin) {
      if (!evaluatorUsername) {
        throw new BadRequestException(
          `Evaluator name is required when the logged-in user is an administrator.`,
        );
      }

      const evaluatorUser = await this.userService.findOneByUsername(evaluatorUsername);
      if (!evaluatorUser.rol || evaluatorUser.rol.name !== ValidRoles.evaluator) {
        throw new BadRequestException(
          `The provided evaluator name does not have the evaluator role.`,
        );
      }

      return evaluatorUser.name;
    }

    throw new BadRequestException(
      `You do not have the necessary permissions to create a certification.`,
    );
  }
}

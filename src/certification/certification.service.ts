import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { ClassroomService } from '../classroom/classroom.service';
import { ClassroomStatus } from '../classroom/enums/classroom-status.enum';
import { UserService } from '../user/user.service';
import { ValidRoles } from '../common/enums/valid-roles';
import { AuthorityService } from '../authority/authority.service';

@Injectable()
export class CertificationService {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    private readonly classroomService: ClassroomService,
    private readonly userService: UserService,
    private readonly authorityService: AuthorityService,
  ) {}

  async create(createCertificationDto: CreateCertificationDto, username: string) {
    const { 
      classroomId, 
      evaluatorUsername, 
      authorityIds,
      ...otherAttributes 
    } = createCertificationDto;
  
    const classroom = await this.classroomService.findOne(classroomId);
  
    if (classroom.status !== ClassroomStatus.EVALUADA) {
      throw new BadRequestException(
        `Classroom with ID ${classroomId} is not eligible for certification. Current status: ${classroom.status}`,
      );
    }

    const evaluator = await this.determineEvaluatorName(
      username,
      evaluatorUsername,
    );

    const certification = this.certificationRepository.create({
      classroom,
      evaluatorName: evaluator,
      ...otherAttributes,
    });

    if (authorityIds && authorityIds.length > 0) {
      const authorities = await this.authorityService.findAuthoritiesByIds(authorityIds);
      
      if (authorities.length !== authorityIds.length) {
        throw new BadRequestException('Some authorities could not be found');
      }
  
      certification.authorities = authorities;
    }
  
    return this.certificationRepository.save(certification);
  }

  async findAll() {
    const certifications = await this.certificationRepository.find({
      relations: [
        'classroom',
        'classroom.team',
        'classroom.team.personals',
        'authorities'
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return certifications;
  }

  async findOne(id: number) {
    const certification = await this.certificationRepository.findOne({
      where: { id },
      relations: [
        'classroom',
        'classroom.team',
        'classroom.team.personals',
        'authorities'
      ],
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
      relations: [
        'classroom',
        'classroom.team',
        'classroom.team.personals',
        'authorities'
      ],
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

    const { 
      evaluatorUsername, 
      classroomId, 
      authorityIds, 
      ...updateData 
    } = updateCertificationDto;

    if (classroomId) {
      const classroom = await this.classroomService.findOne(classroomId);
      if (classroom.status !== ClassroomStatus.EVALUADA) {
        throw new BadRequestException(
          `Classroom with ID ${classroomId} is not eligible for certification. Current status: ${classroom.status}`,
        );
      }

      preloadedCertification.classroom = classroom;
    }

    if (evaluatorUsername !== undefined) {
      const validatedEvaluatorName = await this.determineEvaluatorName(
        username,
        evaluatorUsername,
      );
      preloadedCertification.evaluatorName = validatedEvaluatorName;
    }

    if (authorityIds !== undefined) {
      if (authorityIds.length > 0) {
        const authorities = await this.authorityService.findAuthoritiesByIds(authorityIds);
        
        if (authorities.length !== authorityIds.length) {
          throw new BadRequestException('Some authorities could not be found');
        }
  
        preloadedCertification.authorities = authorities;
      } else {
        preloadedCertification.authorities = [];
      }
    }
  
    Object.assign(preloadedCertification, updateData);

    await this.certificationRepository.save(preloadedCertification);

    return await this.certificationRepository.findOne({
      where: { id },
      relations: ['classroom', 'authorities']
    });
  }

  async remove(id: number) {
    const certification = await this.certificationRepository.findOne({
      where: { id },
      relations: ['authorities']
    });
    
    if (!certification) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
  
    await this.certificationRepository.manager.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.query(
        `DELETE FROM certification_authorities WHERE certification_id = ?`,
        [id]
      );
  
      await transactionalEntityManager.remove(certification);
    });
  
    return certification;
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

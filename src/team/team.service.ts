import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { TechnicalStaffService } from '../technical-staff/technical-staff.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly technicalStaffService: TechnicalStaffService,
  ){}

  async create(createTeamDto: CreateTeamDto) {
    const { personal, ...teamData } = createTeamDto;

    if (!personal || personal.length === 0) {
      throw new BadRequestException('At least one personal ID is required to create a team');
    }

    const personalEntities = await this.technicalStaffService.findPersonalEntities(personal);

    const team = this.teamRepository.create({
      ...teamData,
      personals: personalEntities
    });

    return await this.teamRepository.save(team);
  }

  async findAll() {
     return await this.teamRepository.find({
      relations: {
        personals: true
      },  
    });
  }

  async findOne(id: number) {
    const team = await this.teamRepository.findOne({ 
      relations: {
        personals: true
      },
      where: { id }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`)
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const team = await this.findOne(id);
    const { personal } = updateTeamDto;

    Object.assign(team, updateTeamDto);

    if (updateTeamDto.personal !== undefined) {
      team.personals = personal.length > 0
        ? await this.technicalStaffService.findPersonalEntities(personal)
        : [];
    }

    return await this.teamRepository.save(team);
  }

  async remove(id: number) {
    const team = await this.findOne(id);

    team.personals = [];
    await this.teamRepository.save(team);

    return this.teamRepository.remove(team);
  }
}

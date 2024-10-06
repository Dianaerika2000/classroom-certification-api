import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({ status: 201, description: 'Team was created successfully', type: Team })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    const team = await this.teamService.create(createTeamDto)
    return {
      message: "Equipo creado exitosamente",
      data: {
        team
      }
    };
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({ status: 200, description: 'List of all teams', type: [Team] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const teams = await this.teamService.findAll();
    return {
      message: "Equipos obtenidos exitosamente",
      data: {
        teams
      }
    }
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'The found team', type: Team })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@Param('id') id: string) {
    const team = await this.teamService.findOne(+id);
    return {
      message: "Equipo obtenido exitosamente",
      data: {
        team
      }
    }
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'The updated team', type: Team })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    const team = await this.teamService.update(+id, updateTeamDto);
    return {
      message: "Equipo actualizado exitosamente",
      data: {
        team
      }
    }
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiParam({ name: 'id', type: 'number', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'The deleted team', type: Team })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async remove(@Param('id') id: string) {
    const team = await this.teamService.remove(+id);
    return {
      message: "Equipo eliminado exitosamente",
      data: {
        team
      }
    }
  }
}

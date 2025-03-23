import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Personal } from './entities/personal';
import { TechnicalStaffService } from './technical-staff.service';
import { CreateTechnicalStaffDto } from './dto/create-technical-staff.dto';
import { UpdateTechnicalStaffDto } from './dto/update-technical-staff.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Personal')
@Auth(ValidRoles.admin, ValidRoles.evaluator, ValidRoles.dedteF)
@Controller('personal')
export class TechnicalStaffController {
  constructor(private readonly technicalStaffService: TechnicalStaffService) {}

  @Post()
  @ApiResponse({status: 201, description: 'Technical staff was created', type: Personal})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async create(
    @Body() createTechnicalStaffDto: CreateTechnicalStaffDto,
  ) {
    const technicalStaff = await this.technicalStaffService.create(createTechnicalStaffDto);
    
    return {
      message: "Personal técnico creado exitosamente",
      data: {
        personal: technicalStaff,
      }
    };
  }

  @Get()
  @ApiResponse({status: 200, description: 'List of all technical staff members retrieved successfully.'})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async findAll() {
    const technicalStaff = await this.technicalStaffService.findAll();
    
    return {
      message: "Personal técnico obtenidos exitosamente",
      data: {
        personals: technicalStaff,
      }
    }
  }

  @Get(':id')
  @ApiResponse({status: 200, description: 'Technical staff member retrieved successfully.', type: Personal})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async findOne(@Param('id') id: string) {
    const technicalStaff = await this.technicalStaffService.findOne(+id);
    
    return {
      message: "Personal técnico obtenido exitosamente",
      data: {
        personal: technicalStaff,
      }
    }
  }

  @Patch(':id')
  @ApiResponse({status: 200, description: 'Technical staff member updated successfully.', type: Personal})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async update(
    @Param('id') id: string, 
    @Body() updateTechnicalStaffDto: UpdateTechnicalStaffDto,
  ) {
    const technicalStaff = await this.technicalStaffService.update(+id, updateTechnicalStaffDto);

    return {
      message: "Personal técnico actualizado exitosamente",
      data: {
        personal: technicalStaff,
      }
    }
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: 'Technical staff member deleted successfully.', type: Personal})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async remove(@Param('id') id: string) {
    const technicalStaff = await this.technicalStaffService.remove(+id)
    
    return {
      message: "Personal técnico eliminado exitosamente",
      data: {
        personal: technicalStaff,
      }
    }
  }
}

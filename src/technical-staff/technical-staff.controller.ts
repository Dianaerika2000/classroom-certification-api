import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { Personal } from './entities/personal';
import { TechnicalStaffService } from './technical-staff.service';
import { CreateTechnicalStaffDto } from './dto/create-technical-staff.dto';
import { UpdateTechnicalStaffDto } from './dto/update-technical-staff.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';

@ApiTags('Personal')
@Controller('personal')
export class TechnicalStaffController {
  constructor(private readonly technicalStaffService: TechnicalStaffService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({status: 201, description: 'Technical staff was created', type: Personal})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  //@UseInterceptors(FileInterceptor('signature'))
  async create(
    @Body() createTechnicalStaffDto: CreateTechnicalStaffDto,
    //@UploadedFile() signature: Express.Multer.File
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
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
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
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
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
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({status: 200, description: 'Technical staff member updated successfully.', type: Personal})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  //@UseInterceptors(FileInterceptor('signature'))
  async update(
    @Param('id') id: string, 
    @Body() updateTechnicalStaffDto: UpdateTechnicalStaffDto,
    //@UploadedFile() signature?: Express.Multer.File
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
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
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

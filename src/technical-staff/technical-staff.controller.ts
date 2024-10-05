import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TechnicalStaffService } from './technical-staff.service';
import { CreateTechnicalStaffDto } from './dto/create-technical-staff.dto';
import { UpdateTechnicalStaffDto } from './dto/update-technical-staff.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';

@Controller('personal')
export class TechnicalStaffController {
  constructor(private readonly technicalStaffService: TechnicalStaffService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @UseInterceptors(FileInterceptor('signature'))
  async create(
    @Body() createTechnicalStaffDto: CreateTechnicalStaffDto,
    @UploadedFile() signature: Express.Multer.File
  ) {
    const technicalStaff = await this.technicalStaffService.create(createTechnicalStaffDto, signature);
    
    return {
      message: "Personal técnico creado exitosamente",
      data: {
        personal: technicalStaff,
      }
    };
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
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
  @UseInterceptors(FileInterceptor('signature'))
  async update(
    @Param('id') id: string, 
    @Body() updateTechnicalStaffDto: UpdateTechnicalStaffDto,
    @UploadedFile() signature?: Express.Multer.File
  ) {
    const technicalStaff = await this.technicalStaffService.update(+id, updateTechnicalStaffDto, signature);

    return {
      message: "Personal técnico actualizado exitosamente",
      data: {
        personal: technicalStaff,
      }
    }
  }

  @Delete(':id')
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

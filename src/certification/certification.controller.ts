import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Certification } from './entities/certification.entity';
import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Certifications')
@Controller('certification')
@Auth(ValidRoles.admin, ValidRoles.evaluator)
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new certification' })
  @ApiResponse({ status: 201, description: 'Certification was created successfully', type: Certification })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(
    @Body() createCertificationDto: CreateCertificationDto, 
    @Request() req
  ) {
    const certification = await this.certificationService.create(
      createCertificationDto, 
      req.user.username
    );
    
    return {
      message: "Certificación creada exitosamente",
      data: {
        certification
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all certifications' })
  @ApiResponse({ status: 200, description: 'List of all certifications', type: [Certification] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll() {
    const certifications = await this.certificationService.findAll();
    
    return {
      message: "Certificaciones obtenidas exitosamente",
      data: {
        certifications
      }
    }
  }

  @Get('classroom/:id')
  @ApiOperation({ summary: 'Get all certifications for a specific classroom' })
  @ApiResponse({ status: 200, description: 'List of certifications by classroom', type: [Certification] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async findAllByClassroom(@Param('id') id: string) {
    const certifications = await this.certificationService.findByClassroom(+id);
    
    return {
      message: "Certificaciones del aula obtenidas exitosamente",
      data: {
        certifications
      }
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific certification' })
  @ApiResponse({ status: 200, description: 'Certification found successfully', type: Certification })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async findOne(@Param('id') id: string) {
    const certification = await this.certificationService.findOne(+id);
    
    return {
      message: "Certificación obtenida exitosamente",
      data: {
        certification
      }
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a certification' })
  @ApiResponse({ status: 200, description: 'Certification updated successfully', type: Certification })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateCertificationDto: UpdateCertificationDto,
    @Request() req,
  ) {
    const certification = await this.certificationService.update(
      +id, 
      updateCertificationDto, 
      req.user.username
    );
    
    return {
      message: "Certificación actualizada exitosamente",
      data: {
        certification
      }
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a certification' })
  @ApiResponse({ status: 200, description: 'Certification deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async remove(@Param('id') id: string) {
    await this.certificationService.remove(+id);
    
    return {
      message: "Certificación eliminada exitosamente",
      data: null
    }
  }
}
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { Assessment } from './entities/assessment.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@ApiTags('Assessment')
@Controller('assessment')
export class AssessmentController {
    constructor(
        private readonly assessmentService: AssessmentService
    ) { }

    @Post()
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiResponse({ status: 201, description: 'Assessment was created successfully', type: Assessment })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    async create(@Body() createAssessmentDto: CreateAssessmentDto) {
        const assessment = await this.assessmentService.create(createAssessmentDto);

        return {
            message: "Valoración creada exitosamente",
            data: {
                assessment
            }
        }
    }

    @Post('form')
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiResponse({ status: 201, description: 'Assessment was created successfully', type: Assessment })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    async createByForm(@Body() createAssessmentDto: CreateAssessmentDto) {
        const assessment = await this.assessmentService.createByForm(createAssessmentDto);

        return {
            message: "Valoración de aula creada exitosamente",
            data: {
                assessment
            }
        }
    }

    @Get()
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiResponse({ status: 200, description: 'Assessment retrieved successfully', type: [Assessment] })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    async findAll() {
        const assessments = await this.assessmentService.findAll();
        return {
            message: "Valoraciones de aula obtenidos exitosamente",
            data: {
                assessments
            }
        };
    }

    @Get('form/:formId')
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiParam({ name: 'formId', type: 'number', description: 'The ID of the form' })
    @ApiResponse({ status: 200, description: 'Assessments retrieved successfully', type: [Assessment] })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    @ApiResponse({ status: 404, description: 'The form with the provided ID does not exist' })
    async findByForm(@Param('formId') formId: number) {
        const assessments = await this.assessmentService.findByForm(formId);

        if (assessments.length === 0) {
            return {
                message: `No se encontraron valoraciones para el formulario con ID ${formId}`,
                data: {
                    assessments
                }
            };
        }

        return {
            message: `Valoraciones obtenidas exitosamente para el formulario con ID ${formId}`,
            data: {
                assessments
            }
        };
    }

    @Get(':id')
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiParam({ name: 'id', type: 'number', description: 'The ID of the assessment' })
    @ApiResponse({ status: 200, description: 'Assessment retrieved successfully', type: Assessment })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid form ID' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    @ApiResponse({ status: 404, description: 'Assessment not found' })
    async findOne(@Param('id') id: string) {
        const assessment = await this.assessmentService.findOne(+id);
        return {
            message: `Valoración con ID ${id} obtenido exitosamente`,
            data: {
                assessment
            }
        };
    }

    @Patch(':id')
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiParam({ name: 'id', type: 'number', description: 'The ID of the assessment to update' })
    @ApiResponse({ status: 200, description: 'Assessment updated successfully', type: Assessment })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    @ApiResponse({ status: 404, description: 'Assessment not found' })
    async update(@Param('id') id: string, @Body() updateAssessment: UpdateAssessmentDto) {
        const updatedAssessment = await this.assessmentService.update(+id, updateAssessment);
        return {
            message: `Valoración con ID ${id} actualizada exitosamente`,
            data: {
                updatedAssessment
            }
        };
    }

    @Delete(':id')
    @Auth(ValidRoles.admin, ValidRoles.evaluator)
    @ApiParam({ name: 'id', type: 'number', description: 'The ID of the assessment to delete' })
    @ApiResponse({ status: 200, description: 'Assessment deleted successfully', type: Assessment })
    @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
    @ApiResponse({ status: 404, description: 'Assessment not found' })
    async remove(@Param('id') id: string) {
        const assessment = await this.assessmentService.remove(+id);
        return {
            message: `Valoración con ID ${id} eliminado exitosamente`,
            data: {
                assessment
            }
        }
    }
}

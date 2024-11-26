import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SummaryService } from './summary.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Summary')
@Controller('summary')
@Auth(ValidRoles.admin, ValidRoles.evaluator)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post('calculate/form/:formId')
  @ApiResponse({ status: 201, description: 'Summary calculated and saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async calculateSummary(@Param('formId') formId: number) {
    const summaryData = await this.summaryService.calculateSummary(formId);

    return {
      message: "Resumen calculado exitosamente",
      data: {
        summary: summaryData,
      },
    };
  }

  @Get('form/:formId')
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Summary not found for the provided form' })
  async getSummaryByForm(@Param('formId') formId: number) {
    const summaryData = await this.summaryService.getSummaryByForm(formId);

    return {
      message: "Resumen obtenido exitosamente",
      data: {
        summary: summaryData,
      },
    };
  }
}

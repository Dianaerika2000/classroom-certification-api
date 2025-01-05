import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SummaryService } from './summary.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Summary')
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post('calculate/form/:formId')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
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
}

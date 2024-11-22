import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluatedIndicatorDto } from './create-evaluated-indicator.dto';

export class UpdateEvaluatedIndicatorDto extends PartialType(CreateEvaluatedIndicatorDto) {}
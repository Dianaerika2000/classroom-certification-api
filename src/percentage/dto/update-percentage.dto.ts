import { PartialType } from '@nestjs/swagger';
import { CreatePercentageDto } from './create-percentage.dto';

export class UpdatePercentageDto extends PartialType(CreatePercentageDto) {}

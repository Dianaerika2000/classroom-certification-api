import { PartialType } from '@nestjs/swagger';
import { CreateTechnicalStaffDto } from './create-technical-staff.dto';

export class UpdateTechnicalStaffDto extends PartialType(CreateTechnicalStaffDto) {}

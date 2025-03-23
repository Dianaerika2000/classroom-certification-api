import { PartialType } from '@nestjs/swagger';
import { CreateRequerimentDto } from './create-requeriment.dto';

export class UpdateRequerimentDto extends PartialType(CreateRequerimentDto) {}

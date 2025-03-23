import { PartialType } from '@nestjs/swagger';
import { CreateAttachDto } from './create-attach.dto';

export class UpdateAttachDto extends PartialType(CreateAttachDto) {}

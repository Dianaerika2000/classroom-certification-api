import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summary } from './entities/summary.entity';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { Form } from 'src/form/entities/form.entity';
import { AreaModule } from 'src/area/area.module';
import { FormModule } from 'src/form/form.module';
import { AssessmentModule } from 'src/assessment/assessment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Summary]),
    AreaModule,
    AssessmentModule,
    FormModule,
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}

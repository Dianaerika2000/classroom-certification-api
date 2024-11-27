import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summary } from './entities/summary.entity';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { AreaModule } from '../area/area.module';
import { FormModule } from '../form/form.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Summary]),
    AuthModule,
    AreaModule,
    AssessmentModule,
    FormModule,
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}

import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { AuthModule } from 'src/auth/auth.module';
import { CycleModule } from 'src/cycle/cycle.module';
import { ResourceModule } from 'src/resource/resource.module';
import { IndicatorModule } from 'src/indicator/indicator.module';
import { AreaModule } from 'src/area/area.module';
import { MoodleModule } from 'src/moodle/moodle.module';
import { TechnicalDesignService } from './organizational-aspects/technical-design/technical-design.service';
import { TrainingDesignService } from './organizational-aspects/training-design/training-design.service';
import { TechnicalDesignCycleIiService } from './cycle-ii/technical-design-cycle-ii/technical-design-cycle-ii.service';
import { TrainingDesignCycleIiService } from './cycle-ii/training-design-cycle-ii/training-design-cycle-ii.service';
import { IndicatorEvaluationService } from './indicator-evaluation/indicator-evaluation.service';
import { MoodleAnalysisService } from './moodle-analysis/moodle-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation]),
    AuthModule,
    ClassroomModule,
    MoodleModule,
    CycleModule,
    AreaModule,
    ResourceModule,
    IndicatorModule
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService, TechnicalDesignService, TrainingDesignService, TechnicalDesignCycleIiService, TrainingDesignCycleIiService, IndicatorEvaluationService, MoodleAnalysisService],
})
export class EvaluationModule {}

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
import { Cycle1TechnicalDesignService, Cycle1TrainingDesignService, Cycle3TechnicalDesignService, Cycle3TrainingDesignService, TechnicalDesignCycleIiService, TechnicalDesignService, TrainingDesignCycleIiService, TrainingDesignService } from './cycles/cycles';
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
  providers: [
    EvaluationService, 
    Cycle1TrainingDesignService, 
    Cycle1TechnicalDesignService,
    Cycle3TrainingDesignService,
    Cycle3TechnicalDesignService,
    TechnicalDesignService, 
    TrainingDesignService, 
    TechnicalDesignCycleIiService, 
    TrainingDesignCycleIiService, 
    IndicatorEvaluationService, 
    MoodleAnalysisService
  ],
})
export class EvaluationModule {}

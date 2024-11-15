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
import { OrganizationalaspectsService } from './organizationalaspects/organizationalaspects.service';
import { Cycle2Service } from './cycle2/cycle2.service';

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
  providers: [EvaluationService, OrganizationalaspectsService, Cycle2Service],
})
export class EvaluationModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentService } from './assessment.service';
import { RequerimentService } from './requeriment.service';
import { AssessmentController } from './assessment.controller';
import { Assessment } from './entities/assessment.entity';
import { Requeriment } from './entities/requeriment.entity';
import { TechnicalAreaService } from './areas/technical-area/technical-area.service';
import { GraphicAreaService } from './areas/graphic-area/graphic-area.service';
import { FormationAreaService } from './areas/formation-area/formation-area.service';
import { AuthModule } from '../auth/auth.module';
import { FormModule } from '../form/form.module';
import { AreaModule } from '../area/area.module';
import { AwsModule } from '../aws/aws.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, Requeriment]),
    AuthModule,
    FormModule,
    AreaModule,
    AwsModule,
    EvaluationModule
  ],
  providers: [
    AssessmentService, 
    RequerimentService, 
    TechnicalAreaService, 
    GraphicAreaService, 
    FormationAreaService
  ],
  controllers: [AssessmentController],
  exports: [AssessmentService]
})
export class AssessmentModule {}

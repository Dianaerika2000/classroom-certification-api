import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FormModule } from 'src/form/form.module';
import { AreaModule } from 'src/area/area.module';
import { RequerimentService } from './requeriment.service';
import { Requeriment } from './entities/requeriment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, Requeriment]),
    AuthModule,
    FormModule,
    AreaModule
  ],
  providers: [AssessmentService, RequerimentService],
  controllers: [AssessmentController],
  exports: [AssessmentService]
})
export class AssessmentModule {}

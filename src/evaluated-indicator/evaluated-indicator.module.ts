import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatedIndicators } from './entities/evaluated-indicator.entity';
import { EvaluatedIndicatorsService } from './evaluated-indicator.service';
import { EvaluatedIndicatorController } from './evaluated-indicator.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluatedIndicators]),
  ],
  providers: [EvaluatedIndicatorsService],
  exports: [EvaluatedIndicatorsService],
  controllers: [EvaluatedIndicatorController]
})
export class EvaluatedIndicatorModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatedIndicators } from './entities/evaluated-indicator.entity';
import { EvaluatedIndicatorsService } from './evaluated-indicator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluatedIndicators]),
  ],
  providers: [EvaluatedIndicatorsService],
  exports: [EvaluatedIndicatorsService]
})
export class EvaluatedIndicatorModule {}

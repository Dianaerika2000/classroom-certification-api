import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PercentageService } from './percentage.service';
import { PercentageController } from './percentage.controller';
import { Percentage } from './entities/percentage.entity';
import { AreaModule } from '../area/area.module';
import { CycleModule } from '../cycle/cycle.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Percentage]),
    AreaModule,
    CycleModule,
    AuthModule,
  ],
  controllers: [PercentageController],
  providers: [PercentageService],
  exports: [PercentageService]
})
export class PercentageModule {}

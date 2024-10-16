import { Module } from '@nestjs/common';
import { IndicatorService } from './indicator.service';
import { IndicatorController } from './indicator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indicator } from './entities/indicator.entity';
import { AreaModule } from 'src/area/area.module';
import { ResourceModule } from 'src/resource/resource.module';
import { ContentModule } from 'src/content/content.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Indicator]),
    AreaModule,
    ResourceModule,
    ContentModule,
    AuthModule,
  ],
  controllers: [IndicatorController],
  providers: [IndicatorService],
  exports: [IndicatorService]
})
export class IndicatorModule {}

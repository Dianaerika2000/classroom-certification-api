import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';
import { PlatformModule } from 'src/platform/platform.module';
import { CycleModule } from 'src/cycle/cycle.module';
import { ResourceModule } from 'src/resource/resource.module';
import { ContentModule } from 'src/content/content.module';
import { AreaModule } from 'src/area/area.module';
import { IndicatorModule } from 'src/indicator/indicator.module';
import { PercentageModule } from 'src/percentage/percentage.module';

@Module({
  imports: [RoleModule, UserModule, PlatformModule, CycleModule, ResourceModule, ContentModule, AreaModule, IndicatorModule, PercentageModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}

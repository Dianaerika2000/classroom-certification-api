import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { AuthModule } from '../auth/auth.module';
import { CycleModule } from '../cycle/cycle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Resource ]),
    AuthModule,
    CycleModule
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService]
})
export class ResourceModule {}

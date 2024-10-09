import { Module } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { CycleController } from './cycle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cycle } from './entities/cycle.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cycle]),
    AuthModule,
  ],
  controllers: [CycleController],
  providers: [CycleService],
  exports: [CycleService]
})
export class CycleModule {}

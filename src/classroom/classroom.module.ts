import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { Classroom } from './entities/classroom.entity';
import { AuthModule } from '../auth/auth.module';
import { MoodleModule } from '../moodle/moodle.module';
import { TeamModule } from '../team/team.module';
import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom]),
    AuthModule,
    MoodleModule,
    TeamModule,
    PlatformModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService]
})
export class ClassroomModule {}

import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MoodleModule } from 'src/moodle/moodle.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom]),
    AuthModule,
    MoodleModule,
    TeamModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService]
})
export class ClassroomModule {}

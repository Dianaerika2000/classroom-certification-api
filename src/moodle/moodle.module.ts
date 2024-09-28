import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MoodleService } from './moodle.service';

@Module({
  imports: [HttpModule],
  providers: [MoodleService],
  exports: [MoodleService]
})
export class MoodleModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attach } from './entities/attach.entity';
import { AttachService } from './attach.service';
import { AttachController } from './attach.controller';
import { AwsModule } from '../aws/aws.module';
import { MoodleModule } from '../moodle/moodle.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attach]),
    AwsModule,
    MoodleModule,
    AuthModule
  ],
  controllers: [AttachController],
  providers: [AttachService],
})
export class AttachModule {}

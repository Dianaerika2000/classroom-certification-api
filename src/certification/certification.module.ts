import { Module } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { CertificationController } from './certification.controller';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { TeamModule } from 'src/team/team.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from './entities/certification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certification]),
    ClassroomModule,
    UserModule,
    AuthModule
  ],
  controllers: [CertificationController],
  providers: [CertificationService],
})
export class CertificationModule {}

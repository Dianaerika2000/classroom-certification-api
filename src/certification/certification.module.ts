import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { Certification } from './entities/certification.entity';
import { ClassroomModule } from '../classroom/classroom.module';
import { AuthorityModule } from '../authority/authority.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certification]),
    ClassroomModule,
    UserModule,
    AuthModule,
    AuthorityModule,
  ],
  controllers: [CertificationController],
  providers: [CertificationService],
})
export class CertificationModule {}

import { Module } from '@nestjs/common';
import { TechnicalStaffService } from './technical-staff.service';
import { TechnicalStaffController } from './technical-staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from './entities/personal';
import { AwsModule } from 'src/aws/aws.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personal]),
    AuthModule,
    AwsModule,
  ],
  controllers: [TechnicalStaffController],
  providers: [TechnicalStaffService],
  exports: [TechnicalStaffService]
})
export class TechnicalStaffModule {}

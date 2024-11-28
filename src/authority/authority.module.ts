import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorityService } from './authority.service';
import { AuthorityController } from './authority.controller';
import { Authority } from './entities/authority.entity';
import { AwsModule } from '../aws/aws.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Authority]),
    AwsModule,
    AuthModule,
  ],
  controllers: [AuthorityController],
  providers: [AuthorityService],
  exports: [AuthorityService]
})
export class AuthorityModule {}

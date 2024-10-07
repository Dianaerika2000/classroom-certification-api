import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TechnicalStaffModule } from 'src/technical-staff/technical-staff.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team]),
    TechnicalStaffModule,
    AuthModule
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}

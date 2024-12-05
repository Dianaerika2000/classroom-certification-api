import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MoodleModule } from './moodle/moodle.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { SeedModule } from './seed/seed.module';
import { AwsModule } from './aws/aws.module';
import { TeamModule } from './team/team.module';
import { TechnicalStaffModule } from './technical-staff/technical-staff.module';
import { CycleModule } from './cycle/cycle.module';
import { ResourceModule } from './resource/resource.module';
import { ContentModule } from './content/content.module';
import { AreaModule } from './area/area.module';
import { IndicatorModule } from './indicator/indicator.module';
import { PercentageModule } from './percentage/percentage.module';
import { ClassroomModule } from './classroom/classroom.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { FormModule } from './form/form.module';
import { AssessmentModule } from './assessment/assessment.module';
import { SummaryModule } from './summary/summary.module';
import { EvaluatedIndicatorModule } from './evaluated-indicator/evaluated-indicator.module';
import { CertificationModule } from './certification/certification.module';
import { CommonModule } from './common/common.module';
import { AuthorityModule } from './authority/authority.module';
import { PlatformModule } from './platform/platform.module';
import { AttachModule } from './attach/attach.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DB_URL'),
        //host: configService.get('DB_HOST'),
        //port: configService.get('DB_PORT'),
        //username: configService.get('DB_USERNAME'),
        //password: configService.get('DB_PASSWORD'),
        //database: configService.get('DB_DATABASE'),
        entities: ['dist/**/entities/*.entity{.ts,.js}'],
        timezone: 'America/La_Paz',
        synchronize: true,
        autoLoadEntities: true,
        cache: false
      })
    }),
    AuthModule,
    MoodleModule,
    UserModule,
    RoleModule,
    SeedModule,
    AwsModule,
    TeamModule,
    TechnicalStaffModule,
    CycleModule,
    ResourceModule,
    ContentModule,
    AreaModule,
    IndicatorModule,
    PercentageModule,
    ClassroomModule,
    EvaluationModule,
    FormModule,
    AssessmentModule,
    SummaryModule,
    EvaluatedIndicatorModule,
    CertificationModule,
    CommonModule,
    AuthorityModule,
    PlatformModule,
    AttachModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

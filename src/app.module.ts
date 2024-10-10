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
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: ['dist/**/entities/*.entity{.ts,.js}'],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

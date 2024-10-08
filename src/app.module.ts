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
      })
    }),
    AuthModule,
    MoodleModule,
    UserModule,
    RoleModule,
    SeedModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

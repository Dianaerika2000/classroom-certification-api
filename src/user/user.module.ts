import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleModule } from 'src/role/role.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoodleModule } from 'src/moodle/moodle.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
    MoodleModule,
    PassportModule,
    // AuthModule
    forwardRef(() => AuthModule)
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule]
})
export class UserModule {}

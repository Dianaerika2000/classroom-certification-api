import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ClassroomModule } from 'src/classroom/classroom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form]),
    AuthModule,
    ClassroomModule
  ],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService]
})
export class FormModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { Platform } from './entities/platform.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Platform]),
    AuthModule,
  ],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService]
})
export class PlatformModule {}

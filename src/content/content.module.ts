import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ResourceModule } from 'src/resource/resource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    ResourceModule,
    AuthModule
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService]
})
export class ContentModule {}

import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';
import { PlatformModule } from 'src/platform/platform.module';

@Module({
  imports: [RoleModule, UserModule, PlatformModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}

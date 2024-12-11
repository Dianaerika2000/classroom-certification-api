import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ValidRoles } from '../common/enums/valid-roles';
import { CreatePlatformDto } from '../platform/dto/create-platform.dto';
import { PlatformService } from '../platform/platform.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService,
  ){}

  async executeSeed(): Promise<void> {
    const roles = [
      { name: ValidRoles.admin },
      { name: ValidRoles.evaluator },
    ];

    for (const role of roles) {
      const existingRole = await this.roleService.findByName(role.name);
      if (!existingRole) {
        await this.roleService.create(role);
      }
    }

    const adminRole = await this.roleService.findByName(ValidRoles.admin);
    const adminUser:CreateUserDto = {
      name: this.configService.get('ADMIN_NAME'),
      username: this.configService.get('ADMIN_USERNAME'),
      password: this.configService.get('ADMIN_USERNAME'),
      roleId: adminRole.id  
    }
    await this.userService.create(adminUser);

    // Seed platforms
    const platforms = this.parsePlatforms();
    for (const platform of platforms) {
      const existingPlatform = await this.platformService.findOneByUrl(platform.url);
      if (!existingPlatform) {
        const createPlatformDto: CreatePlatformDto = {
          name: platform.name,
          url: platform.url,
          token: platform.token,
        };
        await this.platformService.create(createPlatformDto);
      }
    }
  }

  private parsePlatforms(): { name: string; url: string; token: string }[] {
    const platformsJson = this.configService.get<string>('PLATFORMS') || '[]';
    try {
      return JSON.parse(platformsJson);
    } catch (error) {
      throw new Error('Invalid PLATFORMS configuration. Ensure it is valid JSON.');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ValidRoles } from '../common/enums/valid-roles';
import { CreatePlatformDto } from '../platform/dto/create-platform.dto';
import { PlatformService } from '../platform/platform.service';
import { CycleService } from 'src/cycle/cycle.service';
import { cyclesItems } from './config/cycles.constants';
import { areasItems } from './config/areas.constants';
import { ResourceService } from 'src/resource/resource.service';
import { ContentService } from 'src/content/content.service';
import { AreaService } from 'src/area/area.service';
import { IndicatorService } from 'src/indicator/indicator.service';
import { CreateIndicatorDto } from 'src/indicator/dto/create-indicator.dto';
import { PercentageService } from 'src/percentage/percentage.service';
import { percentageItems } from './config/percentage.constants';
import { CreatePercentageDto } from 'src/percentage/dto/create-percentage.dto';

@Injectable()
export class SeedService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService,
    private readonly cycleService: CycleService,
    private readonly resourceService: ResourceService,
    private readonly contentService: ContentService,
    private readonly areaService: AreaService,
    private readonly indicatorService: IndicatorService,
    private readonly percentageService: PercentageService
  ) { }

  async executeSeed(): Promise<void> {
    const roles = [
      { name: ValidRoles.admin },
      { name: ValidRoles.evaluator },
      { name: ValidRoles.dedteF },
    ];

    for (const role of roles) {
      const existingRole = await this.roleService.findByName(role.name);
      if (!existingRole) {
        await this.roleService.create(role);
      }
    }

    const adminRole = await this.roleService.findByName(ValidRoles.admin);
    const adminUser: CreateUserDto = {
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

    await this.seedCycles();
    await this.seedAreasAndIndicators();
    await this.seedPercentage();
  }

  private parsePlatforms(): { name: string; url: string; token: string }[] {
    const platformsJson = this.configService.get<string>('PLATFORMS') || '[]';
    try {
      return JSON.parse(platformsJson);
    } catch (error) {
      throw new Error('Invalid PLATFORMS configuration. Ensure it is valid JSON.');
    }
  }

  private async seedCycles(): Promise<void> {
    for (const [cycleName, resources] of Object.entries(cyclesItems)) {
      // Crear ciclo
      let existingCycle = await this.cycleService.findByName(cycleName);
      if (!existingCycle) {
        existingCycle = await this.cycleService.create({ name: cycleName });
      }

      // Crear los recursos
      for (const resource of resources) {
        let existingResource = await this.resourceService.findByName(resource.name);
        if (!existingResource) {
          existingResource = await this.resourceService.create({
            name: resource.name,
            cycleId: existingCycle.id
          });
        }

        // Crear contenidos si existe
        if (this.hasSubItems(resource)) {
          for (const content of resource.subItems) {
            const existingContent = await this.contentService.findByName(content);
            if (!existingContent) {
              await this.contentService.create({
                name: content,
                resourceId: existingResource.id
              })
            }
          }
        }
      }
    }
  }

  private hasSubItems(resource: { name: string; subItems?: string[] }): resource is { name: string; subItems: string[] } {
    return Array.isArray(resource.subItems);
  }

  private async seedAreasAndIndicators(): Promise<void> {
    for (const [areaName, items] of Object.entries(areasItems)) {
      let area = await this.areaService.findByName(areaName);
      if (!area) {
        area = await this.areaService.create({ name: areaName});
      }

      for (const item of items) {
        if (item.resource) {
          const resource = await this.resourceService.findByName(item.resource);
          if (!resource) {
            throw new Error(`Resource "${item.resource}" not found for area "${areaName}".`);
          }

          for (const indicatorName of item.indicators) {
            const createIndicatorDto: CreateIndicatorDto = {
              name: indicatorName,
              areaId: area.id,
              resourceId: resource.id,
              contentId: null
            };
            await this.indicatorService.create(createIndicatorDto);
          }
        } else if (item.content) {
          const content = await this.contentService.findByName(item.content);
          if (!content) {
            throw new Error(`Content "${item.content}" not found for area "${areaName}".`);
          }

          for (const indicatorName of item.indicators) {
            const createIndicatorDto: CreateIndicatorDto = {
              name: indicatorName,
              areaId: area.id,
              resourceId: null,
              contentId: content.id
            };
            await this.indicatorService.create(createIndicatorDto);
          }
        } else {
          throw new Error(`Invalid item in area "${areaName}". Each item must have a "resource" or "content" property.`);
        }
      }
    }
  }

  private async seedPercentage(): Promise<void> {
    for (const [areaName, percentages] of Object.entries(percentageItems)) {
      const area = await this.areaService.findByName(areaName);
      if (!area) {
        throw new Error(`Area "${areaName}" not found.`);
      }

      for (const { name: cycleName, value: percentage } of percentages) {
        const cycle = await this.cycleService.findByName(cycleName);
        if (!cycle) {
          throw new Error(`Cycle "${cycleName}" not found.`);
        }

        const createPercentageDto: CreatePercentageDto = {
          areaId: area.id,
          cycleId: cycle.id,
          percentage: percentage
        };

        try {
          await this.percentageService.create(createPercentageDto);
        } catch (error) {
          console.error(
            `Error creating percentage for area "${areaName}" and cycle "${cycleName}": ${error.message}`
          );
        }
      }
    }
  }
}

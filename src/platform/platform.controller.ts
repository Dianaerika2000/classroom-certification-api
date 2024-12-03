import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';

@ApiTags('Platforms')
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post()
  async create(@Body() createPlatformDto: CreatePlatformDto) {
    const platform = await this.platformService.create(createPlatformDto);

    return {
      message: "Platform created successfully",
      data: {
        platform,
      },
    };
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({ status: 200, description: 'Platforms retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  async findAll() {
    const platforms = await this.platformService.findAll();

    return {
      message: "Platforms retrieved successfully",
      data: {
        platforms,
      },
    };
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @ApiResponse({ status: 200, description: 'Platform retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid platform ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Platform not found' })
  async findOne(@Param('id') id: string) {
    const platform = await this.platformService.findOne(+id);

    return {
      message: "Platform retrieved successfully",
      data: {
        platform,
      },
    };
  }

  @Post(':id/set-environment')
  @Auth(ValidRoles.admin, ValidRoles.evaluator)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Environment variables updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Access denied' })
  @ApiResponse({ status: 404, description: 'Platform not found' })
  async setEnvironmentVariables(@Param('id') id: string) {
    const platform = await this.platformService.setPlatformEnvironmentVariables(+id);

    return {
      message: "Environment variables updated successfully",
      data: platform
    }; 
  }
}

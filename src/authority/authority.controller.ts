import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorityService } from './authority.service';
import { CreateAuthorityDto } from './dto/create-authority.dto';
import { UpdateAuthorityDto } from './dto/update-authority.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authority') 
@Controller('authority')
@Auth(ValidRoles.admin, ValidRoles.evaluator)
export class AuthorityController {
  constructor(private readonly authorityService: AuthorityService) {}
  
  @Post()
  @ApiResponse({status: 201, description: 'Authority was created successfully'})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @UseInterceptors(FileInterceptor('signature'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createAuthorityDto: CreateAuthorityDto,
    @UploadedFile() signature: Express.Multer.File
  ) {
    const authority = await this.authorityService.create(createAuthorityDto, signature);
    
    return {
      message: "Autoridad creada exitosamente",
      data: {
        authority,
      }
    };
  }

  @Get()
  @ApiResponse({status: 200, description: 'Authorities retrieved successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async findAll() {
    const authorities = await this.authorityService.findAll();
    
    return {
      message: "Autoridades obtenidas exitosamente",
      data: {
        authorities,
      }
    };
  }

  @Get(':id')
  @ApiResponse({status: 200, description: 'Authority retrieved successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 404, description: 'Authority not found'})
  async findOne(@Param('id') id: string) {
    const authority = await this.authorityService.findOne(+id);
    
    return {
      message: "Autoridad obtenida exitosamente",
      data: {
        authority,
      }
    };
  }

  @Patch(':id')
  @ApiResponse({status: 200, description: 'Authority updated successfully'})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 404, description: 'Authority not found'})
  @UseInterceptors(FileInterceptor('signature'))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorityDto: UpdateAuthorityDto,
    @UploadedFile() signature?: Express.Multer.File,
  ) {
    const authority = await this.authorityService.update(+id, updateAuthorityDto, signature);
    
    return {
      message: "Autoridad actualizada exitosamente",
      data: {
        authority,
      }
    };
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: 'Authority deleted successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 404, description: 'Authority not found'})
  async remove(@Param('id') id: string) {
    const authority = await this.authorityService.remove(+id);
    
    return {
      message: "Autoridad eliminada exitosamente",
      data: authority
    };
  }
}

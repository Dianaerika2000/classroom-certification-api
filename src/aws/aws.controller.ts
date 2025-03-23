import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  register(
    @UploadedFile() photo: Express.Multer.File,
    ) {
    return this.awsService.uploadImageToS3(photo.buffer);
  }

  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const { buffer, originalname, mimetype } = file;

    const uploadResult = await this.awsService.uploadFileToS3(buffer, originalname, mimetype);

    return { url: uploadResult };
  }
}

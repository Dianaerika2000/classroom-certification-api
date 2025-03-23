import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  constructor(
    private readonly configService: ConfigService
  ){}

  async uploadImageToS3( photoBuffer: Buffer, name: string = 'default') {

    const s3Bucket = this.configService.get('AWS_BUCKET');

    const s3Client = new S3Client({
      region: this.configService.get('AWS_DEFAULT_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    try {
      const s3Object = await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: `user_signature_${name}`,
          Body: photoBuffer,
          ContentType: 'image/jpeg',
        }),
      );
      
      const s3ObjectUrl = `https://${s3Bucket}.s3.amazonaws.com/user_signature_${name}`;
    
      return {
        photoUrl: s3ObjectUrl,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error uploading image to S3', error.message);
    }
  }

  async uploadFileToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const s3Bucket = this.configService.get('AWS_BUCKET');

    const s3Client = new S3Client({
      region: this.configService.get('AWS_DEFAULT_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    try {
      const key = `uploads/${fileName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
        }),
      );

      const fileUrl = `https://${s3Bucket}.s3.amazonaws.com/${key}`;

      return fileUrl;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to S3', error.message);
    }
  }
}

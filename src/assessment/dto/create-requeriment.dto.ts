import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRequerimentDto {
    @ApiProperty({
        example: 'PA-FPAV',
        description: 'The name of the requeriment.',
        type: String,
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'https://example-url.com',
        description: 'The url of the requeriment',
        type: String,
    })
    @IsOptional()
    @IsString()
    url: string;

    @ApiProperty({
        example: '1',
        description: 'The ID of the assessment.',
        type: Number,
    })
    @IsNumber()
    assessmentId: number;
}
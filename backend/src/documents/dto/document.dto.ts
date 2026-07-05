import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../storage/storage.service';

export class UploadUrlDto {
  @ApiProperty({ example: 'receipt-july.jpg' })
  @IsString()
  @MinLength(1)
  fileName: string;

  @ApiProperty({ enum: ALLOWED_MIME_TYPES, example: 'image/jpeg' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 245000, maximum: MAX_FILE_SIZE_BYTES })
  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize: number;
}

export class CreateDocumentDto {
  @ApiProperty({ example: 'July electricity receipt' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: DocumentCategory, example: 'receipt' })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiProperty({ example: 'businesses/uuid/documents/uuid.jpg' })
  @IsString()
  fileKey: string;

  @ApiProperty({ enum: ALLOWED_MIME_TYPES })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 245000 })
  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize: number;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: 'Paid via mobile money' })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const PRESIGN_EXPIRES_SECONDS = 300;

/**
 * S3-compatible storage service for MinIO (DOC-01, DOC-04).
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client!: S3Client;
  private bucket!: string;
  private publicUrlBase!: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const endpoint = this.configService.get<string>('storage.endpoint')!;
    this.bucket = this.configService.get<string>('storage.bucket')!;
    this.publicUrlBase = this.configService.get<string>('storage.publicUrl')!.replace(/\/$/, '');

    this.client = new S3Client({
      endpoint,
      region: this.configService.get<string>('storage.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('storage.accessKey')!,
        secretAccessKey: this.configService.get<string>('storage.secretKey')!,
      },
      forcePathStyle: true,
    });

    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Created storage bucket: ${this.bucket}`);
      } catch (error) {
        this.logger.warn(
          `Storage bucket unavailable (MinIO may be offline): ${(error as Error).message}`,
        );
      }
    }
  }

  validateFile(mimeType: string, fileSize: number): void {
    if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    if (fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size must be between 1 byte and ${MAX_FILE_SIZE_BYTES} bytes`);
    }
  }

  generateFileKey(businessId: string, fileName: string, mimeType: string): string {
    const ext = path.extname(fileName).toLowerCase() || this.extFromMime(mimeType);
    const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
    return `businesses/${businessId}/documents/${randomUUID()}${safeExt}`;
  }

  buildPublicUrl(fileKey: string): string {
    return `${this.publicUrlBase}/${fileKey}`;
  }

  async getUploadUrl(fileKey: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: mimeType,
    });
    return getSignedUrl(this.client, command, { expiresIn: PRESIGN_EXPIRES_SECONDS });
  }

  async getPreviewUrl(fileKey: string, mimeType: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ResponseContentType: mimeType,
    });
    return getSignedUrl(this.client, command, { expiresIn: PRESIGN_EXPIRES_SECONDS });
  }

  async deleteObject(fileKey: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: fileKey }));
  }

  private extFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };
    return map[mimeType] ?? '.bin';
  }
}

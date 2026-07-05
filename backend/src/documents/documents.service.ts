import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { StorageService, ALLOWED_MIME_TYPES } from '../storage/storage.service';
import { CreateDocumentDto, UploadUrlDto } from './dto/document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../common/dto/pagination-query.dto';

/**
 * Document management with S3 presigned upload/preview (DOC-01..04).
 */
@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
    private readonly storageService: StorageService,
  ) {}

  async getUploadUrl(ownerId: string, dto: UploadUrlDto) {
    this.assertValidFile(dto.mimeType, dto.fileSize);

    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const fileKey = this.storageService.generateFileKey(business.id, dto.fileName, dto.mimeType);
    const uploadUrl = await this.storageService.getUploadUrl(fileKey, dto.mimeType);

    return {
      uploadUrl,
      fileKey,
      expiresIn: 300,
    };
  }

  async findAll(ownerId: string, query: DocumentQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.DocumentWhereInput = { businessId: business.id };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.DocumentOrderByWithRelationInput = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'desc' }
      : { date: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: items.map((d) => this.toResponse(d)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(ownerId: string, id: string) {
    const document = await this.getScopedDocument(ownerId, id);
    return this.toResponse(document);
  }

  async getPreviewUrl(ownerId: string, id: string) {
    const document = await this.getScopedDocument(ownerId, id);
    const previewUrl = await this.storageService.getPreviewUrl(document.fileKey, document.mimeType);
    return {
      previewUrl,
      mimeType: document.mimeType,
      name: document.name,
      expiresIn: 300,
    };
  }

  async create(ownerId: string, userId: string, dto: CreateDocumentDto) {
    this.assertValidFile(dto.mimeType, dto.fileSize);

    const business = await this.businessesService.requireBusinessByOwner(ownerId);

    if (!dto.fileKey.startsWith(`businesses/${business.id}/`)) {
      throw new BadRequestException({
        message: 'Invalid file key for this business',
        errorCode: 'DOCUMENT_INVALID_FILE_KEY',
      });
    }

    const document = await this.prisma.document.create({
      data: {
        businessId: business.id,
        name: dto.name,
        category: dto.category,
        fileKey: dto.fileKey,
        fileUrl: this.storageService.buildPublicUrl(dto.fileKey),
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        date: new Date(dto.date),
        amount: dto.amount,
        notes: dto.notes,
        createdById: userId,
      },
    });

    await this.healthScoreService.recalculateAndPersist(business.id);
    return this.toResponse(document);
  }

  async remove(ownerId: string, id: string) {
    const document = await this.getScopedDocument(ownerId, id);

    try {
      await this.storageService.deleteObject(document.fileKey);
    } catch {
      // Continue with DB delete even if object is already gone
    }

    await this.prisma.document.delete({ where: { id } });
    await this.healthScoreService.recalculateAndPersist(document.businessId);
    return { message: 'Document deleted' };
  }

  private assertValidFile(mimeType: string, fileSize: number): void {
    if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException({
        message: 'Only JPEG, PNG, WebP images and PDF files are allowed',
        errorCode: 'DOCUMENT_INVALID_TYPE',
      });
    }

    try {
      this.storageService.validateFile(mimeType, fileSize);
    } catch {
      throw new BadRequestException({
        message: 'File size exceeds the 10 MB limit',
        errorCode: 'DOCUMENT_FILE_TOO_LARGE',
      });
    }
  }

  private async getScopedDocument(ownerId: string, id: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const document = await this.prisma.document.findFirst({
      where: { id, businessId: business.id },
    });
    if (!document) {
      throw new NotFoundException({
        message: 'Document not found',
        errorCode: 'DOCUMENT_NOT_FOUND',
      });
    }
    return document;
  }

  private toResponse(document: {
    id: string;
    name: string;
    category: string;
    fileUrl: string;
    fileKey: string;
    mimeType: string;
    fileSize: number;
    date: Date;
    amount: Prisma.Decimal | null;
    notes: string | null;
    createdAt: Date;
  }) {
    return {
      id: document.id,
      name: document.name,
      category: document.category,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      date: document.date.toISOString().split('T')[0],
      amount: document.amount !== null ? Number(document.amount) : null,
      notes: document.notes,
      createdAt: document.createdAt.toISOString(),
    };
  }
}

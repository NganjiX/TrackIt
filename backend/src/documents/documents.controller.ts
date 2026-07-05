import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UploadUrlDto } from './dto/document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get presigned S3 upload URL (DOC-01)' })
  getUploadUrl(@CurrentUser() user: AuthenticatedUser, @Body() dto: UploadUrlDto) {
    return this.documentsService.getUploadUrl(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List documents with filter and search (DOC-03)' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: DocumentQueryDto) {
    return this.documentsService.findAll(user.id, query);
  }

  @Get(':id/preview-url')
  @ApiOperation({ summary: 'Get presigned preview URL (DOC-04)' })
  getPreviewUrl(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.getPreviewUrl(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document detail' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Register uploaded document metadata (DOC-02)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(user.id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documentsService.remove(user.id, id);
  }
}

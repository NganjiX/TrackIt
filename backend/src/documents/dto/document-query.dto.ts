import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Query parameters for listing documents (DOC-03).
 */
export class DocumentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const SORTABLE_FIELDS = [
  'name',
  'category',
  'price',
  'cost',
  'stockQuantity',
  'createdAt',
] as const;

/**
 * Query parameters for listing products (INV-02, INV-04).
 */
export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SORTABLE_FIELDS })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: (typeof SORTABLE_FIELDS)[number];
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { DebtType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Query parameters for listing debts (DEBT-05).
 */
export class DebtQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DebtType })
  @IsOptional()
  @IsEnum(DebtType)
  type?: DebtType;
}

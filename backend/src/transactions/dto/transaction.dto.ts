import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, TransactionType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Payload for creating a transaction (TXN-01, TXN-02).
 */
export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Produce' })
  @IsString()
  @MinLength(1)
  category: string;

  @ApiProperty({ example: 25000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Tomatoes sale' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ example: '2026-07-05' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 'Tomatoes' })
  @IsString()
  @MinLength(1)
  productService: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

/**
 * Payload for updating a transaction.
 */
export class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productService?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string | null;
}

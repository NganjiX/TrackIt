import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DebtType } from '@prisma/client';
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

export class CreateDebtDto {
  @ApiProperty({ enum: DebtType, example: 'receivable' })
  @IsEnum(DebtType)
  type: DebtType;

  @ApiProperty({ example: 'Marie Uwase' })
  @IsString()
  @MinLength(2)
  partyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 'Credit sale for weekly produce order' })
  @IsString()
  @MinLength(3)
  description: string;
}

export class UpdateDebtDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  partyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;
}

export class RecordDebtPaymentDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'Partial payment via mobile money' })
  @IsOptional()
  @IsString()
  note?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Fresh Tomatoes' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Produce' })
  @IsString()
  @MinLength(2)
  category: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 900 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  lowStockThreshold: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @MinLength(1)
  unit: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;
}

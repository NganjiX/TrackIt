import { ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Length, Min, MinLength } from 'class-validator';

/**
 * Business profile update payload (SET-02).
 */
export class UpdateBusinessDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ enum: BusinessType })
  @IsOptional()
  @IsEnum(BusinessType)
  type?: BusinessType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  numEmployees?: number;

  @ApiPropertyOptional({ example: 'RWF' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}

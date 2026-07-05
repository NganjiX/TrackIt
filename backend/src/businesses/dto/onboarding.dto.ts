import { ApiProperty } from '@nestjs/swagger';
import { BusinessType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

/**
 * Payload persisted on completion of the 3-step onboarding wizard (AUTH-06).
 */
export class OnboardingDto {
  @ApiProperty({ example: 'Kigali Fresh Market' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: BusinessType, example: BusinessType.retail_shop })
  @IsEnum(BusinessType)
  type: BusinessType;

  @ApiProperty({ example: 'Grocery & Produce' })
  @IsString()
  @MinLength(2)
  industry: string;

  @ApiProperty({ example: 'Kigali, Gasabo District' })
  @IsString()
  @MinLength(2)
  location: string;

  @ApiProperty({ example: 3, minimum: 0 })
  @IsInt()
  @Min(0)
  @Max(100)
  yearsOperating: number;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(10000)
  numEmployees: number;

  @ApiProperty({ example: 'Expand to a second location and apply for an MFI loan.' })
  @IsString()
  @MinLength(10)
  goals: string;
}

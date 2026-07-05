import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Jean Bizimungu' })
  @IsString()
  @MinLength(2)
  fullName: string;
}

export class UpdateLanguageDto {
  @ApiProperty({ enum: ['en', 'rw'] })
  @IsIn(['en', 'rw'])
  language: 'en' | 'rw';
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and a number',
  })
  password: string;

  @ApiProperty({ example: 'Jean Bizimungu' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and a number',
  })
  password: string;
}

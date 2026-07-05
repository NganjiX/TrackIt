import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PassportService } from './passport.service';
import { PassportPdfService } from './passport-pdf.service';
import { CreateShareLinkDto } from './dto/passport.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/auth.decorators';

@ApiTags('Passport')
@Controller('passport')
export class PassportController {
  constructor(
    private readonly passportService: PassportService,
    private readonly passportPdfService: PassportPdfService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Full passport payload (PASS-01..04)' })
  getPassport(@CurrentUser() user: AuthenticatedUser) {
    return this.passportService.getPassport(user.id);
  }

  @Post('share-link')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate expiring share link (PASS-05)' })
  createShareLink(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateShareLinkDto) {
    return this.passportService.createShareLink(user.id, dto.expiresInDays ?? 7);
  }

  @Get('export/pdf')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download passport PDF (PASS-05)' })
  async exportPdf(@CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.passportPdfService.generateForOwner(user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="smartledger-passport.pdf"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Public()
  @Get('public/:token')
  @ApiOperation({ summary: 'Public read-only passport for lenders (PASS-05)' })
  getPublicPassport(@Param('token') token: string) {
    return this.passportService.getPublicPassport(token);
  }
}

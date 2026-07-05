import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateLanguageDto, UpdateProfileDto } from './dto/settings.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile (SET-01)' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user name (SET-01)' })
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.settingsService.updateProfile(user.id, dto);
  }

  @Patch('language')
  @ApiOperation({ summary: 'Update language preference (I18N-03)' })
  updateLanguage(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateLanguageDto) {
    return this.settingsService.updateLanguage(user.id, dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health score breakdown for settings (SET-03)' })
  getHealth(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.getHealth(user.id);
  }
}

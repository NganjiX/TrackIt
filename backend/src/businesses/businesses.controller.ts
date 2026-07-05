import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

/**
 * Business profile and onboarding endpoints.
 */
@ApiTags('Businesses')
@ApiBearerAuth()
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post('onboarding')
  @ApiOperation({ summary: 'Complete 3-step onboarding wizard (AUTH-06)' })
  completeOnboarding(@CurrentUser() user: AuthenticatedUser, @Body() dto: OnboardingDto) {
    return this.businessesService.completeOnboarding(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current business profile with health score' })
  getMyBusiness(@CurrentUser() user: AuthenticatedUser) {
    return this.businessesService.getMyBusiness(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update business settings (SET-02)' })
  updateMyBusiness(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.updateMyBusiness(user.id, dto);
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('History')
@ApiBearerAuth()
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('five-year')
  @ApiOperation({ summary: 'Five-year business history rollup (HIST-01..04)' })
  getFiveYear(@CurrentUser() user: AuthenticatedUser) {
    return this.historyService.getFiveYearSummary(user.id);
  }
}

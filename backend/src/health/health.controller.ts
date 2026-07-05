import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/auth.decorators';
import { HealthService } from './health.service';

/**
 * Platform health and readiness endpoints for uptime monitoring.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Liveness/readiness probe used by container orchestration.
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — database connectivity and service status' })
  check() {
    return this.healthService.check();
  }
}

import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { BusinessContextService } from './business-context.service';
import { LlmService } from './llm.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { HealthScoreModule } from '../health-score/health-score.module';

@Module({
  imports: [BusinessesModule, HealthScoreModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService, BusinessContextService, LlmService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}

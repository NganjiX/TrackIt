import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { ChatDto } from './dto/chat.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Get('suggestions')
  @ApiOperation({ summary: 'Starter questions by language (AI-03)' })
  getSuggestions(@Query('language') language?: 'en' | 'rw') {
    return this.aiAssistantService.getSuggestions(language ?? 'en');
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List chat sessions' })
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.aiAssistantService.listSessions(user.id);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get messages for a session' })
  getMessages(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.aiAssistantService.getSessionMessages(user.id, id);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send message and get grounded reply (AI-01, AI-02, AI-04)' })
  chat(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChatDto) {
    return this.aiAssistantService.chat(user.id, dto);
  }
}

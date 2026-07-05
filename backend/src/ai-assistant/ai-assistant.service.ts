import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { BusinessContextService } from './business-context.service';
import { LlmService } from './llm.service';
import { ChatDto, STARTER_SUGGESTIONS } from './dto/chat.dto';

/**
 * AI chat sessions with business-scoped grounding (AI-01..05).
 */
@Injectable()
export class AiAssistantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly businessContextService: BusinessContextService,
    private readonly llmService: LlmService,
  ) {}

  getSuggestions(language: 'en' | 'rw' = 'en') {
    return {
      language,
      suggestions: STARTER_SUGGESTIONS[language] ?? STARTER_SUGGESTIONS.en,
    };
  }

  async listSessions(userId: string) {
    await this.businessesService.requireBusinessByOwner(userId);

    const sessions = await this.prisma.aiChatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    return {
      data: sessions.map((s) => ({
        id: s.id,
        preview: s.messages[0]?.content?.slice(0, 80) ?? '',
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    };
  }

  async getSessionMessages(userId: string, sessionId: string) {
    await this.requireUserSession(userId, sessionId);

    const messages = await this.prisma.aiChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      data: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        language: m.language,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async chat(userId: string, dto: ChatDto) {
    await this.businessesService.requireBusinessByOwner(userId);

    const language = dto.language ?? 'en';
    const context = await this.businessContextService.buildContext(userId);
    const systemPrompt = this.businessContextService.toSystemPrompt(context, language);

    let sessionId = dto.sessionId;
    if (sessionId) {
      await this.requireUserSession(userId, sessionId);
    } else {
      const session = await this.prisma.aiChatSession.create({
        data: { userId },
      });
      sessionId = session.id;
    }

    const priorMessages = await this.prisma.aiChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const history = priorMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const reply = await this.llmService.generateReply(
      systemPrompt,
      history,
      dto.message,
      context,
      language,
    );

    await this.prisma.$transaction([
      this.prisma.aiChatMessage.create({
        data: {
          sessionId,
          role: 'user',
          content: dto.message,
          language,
        },
      }),
      this.prisma.aiChatMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content: reply,
          language,
        },
      }),
      this.prisma.aiChatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return {
      sessionId,
      reply,
      language,
    };
  }

  private async requireUserSession(userId: string, sessionId: string) {
    const session = await this.prisma.aiChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        message: 'Chat session not found',
        errorCode: 'AI_SESSION_NOT_FOUND',
      });
    }

    if (session.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied to this chat session',
        errorCode: 'AI_SESSION_FORBIDDEN',
      });
    }

    return session;
  }
}

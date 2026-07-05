import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessContextSnapshot } from './dto/chat.dto';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * LLM gateway with Anthropic/OpenAI support and grounded fallback (AI-02, AI-04).
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateReply(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
    context: BusinessContextSnapshot,
    language: 'en' | 'rw',
  ): Promise<string> {
    const provider = this.configService.get<string>('ai.provider', 'anthropic');
    const anthropicKey = this.configService.get<string>('ai.anthropicApiKey', '');
    const openaiKey = this.configService.get<string>('ai.openaiApiKey', '');

    try {
      if (provider === 'openai' && openaiKey) {
        return await this.callOpenAi(systemPrompt, history, userMessage, openaiKey);
      }
      if (anthropicKey) {
        return await this.callAnthropic(systemPrompt, history, userMessage, anthropicKey);
      }
      if (openaiKey) {
        return await this.callOpenAi(systemPrompt, history, userMessage, openaiKey);
      }
    } catch (error) {
      this.logger.warn(`LLM call failed, using fallback: ${(error as Error).message}`);
    }

    return this.generateFallbackReply(userMessage, context, language);
  }

  private async callAnthropic(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
    apiKey: string,
  ): Promise<string> {
    const model = this.configService.get<string>('ai.anthropicModel');
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content.find((c) => c.type === 'text')?.text ?? '';
  }

  private async callOpenAi(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
    apiKey: string,
  ): Promise<string> {
    const model = this.configService.get<string>('ai.openaiModel');
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content ?? '';
  }

  /**
   * Rule-based grounded fallback when no LLM API key is configured.
   */
  generateFallbackReply(
    message: string,
    context: BusinessContextSnapshot,
    language: 'en' | 'rw',
  ): string {
    const lower = message.toLowerCase();

    if (language === 'rw') {
      if (lower.includes('inguzanyo') || lower.includes('loan') || lower.includes('kredit')) {
        return `Ubu ufite amanota ${context.healthScore}/100 (${context.creditReadinessLabel}). ${
          context.healthScore >= 70
            ? "Urebye neza kandi ushobora gusaba inguzanyo n'inyandiko zawe za SmartLedger."
            : 'Ongera wandike ibicuruzwa, ohereza inyandiko, kandi wishyure amadeni kugira ngo utere imbere mu kwigira.'
        }`;
      }
      return `Incamake ya ${context.businessName}: Amafaranga yinjiye ${context.totalRevenue.toLocaleString()} ${context.currency}, amafaranga yasohotse ${context.totalExpenses.toLocaleString()} ${context.currency}, inyungu ${context.netProfit.toLocaleString()} ${context.currency}. Amadeni asigaye: ${context.outstandingDebts.toLocaleString()} ${context.currency}. Ufite ibicuruzwa ${context.transactionCount}, inyandiko ${context.documentCount}, n'abakiriya ${context.customerCount}.`;
    }

    if (lower.includes('loan') || lower.includes('credit') || lower.includes('ready')) {
      if (context.healthScore >= 70) {
        return `Based on your health score of ${context.healthScore}/100, ${context.businessName} is in "${context.creditReadinessLabel}" status — a strong position for loan applications. Export your Digital Business Passport and share it with your lender along with recent transaction records.`;
      }
      if (context.healthScore >= 35) {
        return `Your health score is ${context.healthScore}/100 (${context.creditReadinessLabel}). You're making progress, but lenders typically look for scores above 70. Focus on: recording more transactions (you have ${context.transactionCount}), uploading documents (${context.documentCount} so far), and resolving outstanding debts (${context.outstandingDebts.toLocaleString()} ${context.currency} remaining).`;
      }
      return `Your health score is ${context.healthScore}/100 (${context.creditReadinessLabel}). Building a consistent transaction history is the most important first step. You currently have ${context.transactionCount} transactions recorded. Aim for at least 20 regular entries and 3 uploaded documents.`;
    }

    if (lower.includes('improve') || lower.includes('health') || lower.includes('score')) {
      const tips: string[] = [];
      if (context.transactionCount < 20)
        tips.push(`record more transactions (currently ${context.transactionCount}, target 20+)`);
      if (context.documentCount < 3)
        tips.push(`upload receipts and invoices (currently ${context.documentCount}, target 3+)`);
      if (context.customerCount < 3)
        tips.push(`add customers to your ledger (currently ${context.customerCount})`);
      if (context.outstandingDebts > 0)
        tips.push(
          `reduce outstanding debts (${context.outstandingDebts.toLocaleString()} ${context.currency} remaining)`,
        );
      if (tips.length === 0)
        tips.push("maintain your consistent recording habits — you're doing well!");
      return `Your health score is ${context.healthScore}/100. To improve further: ${tips.join('; ')}. Health scores are computed from record completeness (40%), transaction consistency (35%), and debt management (25%).`;
    }

    if (lower.includes('risk') || lower.includes('debt')) {
      return context.outstandingDebts > 0
        ? `Your main financial risk right now is ${context.outstandingDebts.toLocaleString()} ${context.currency} in outstanding debts. Prioritize collecting receivables and paying down payables on schedule. You have ${context.debtCount} debts tracked with ${context.paidDebtCount} fully resolved.`
        : `You have no outstanding debts — that's excellent for credit readiness. Your net profit is ${context.netProfit.toLocaleString()} ${context.currency}. Keep maintaining clean records to preserve this position.`;
    }

    if (lower.includes('summar') || lower.includes('performance') || lower.includes('overview')) {
      return `Here's a summary for ${context.businessName} (${context.passportId}):\n\n• Health Score: ${context.healthScore}/100 — ${context.creditReadinessLabel}\n• Revenue: ${context.totalRevenue.toLocaleString()} ${context.currency}\n• Expenses: ${context.totalExpenses.toLocaleString()} ${context.currency}\n• Net Profit: ${context.netProfit.toLocaleString()} ${context.currency}\n• Outstanding Debts: ${context.outstandingDebts.toLocaleString()} ${context.currency}\n• Activity: ${context.transactionCount} transactions, ${context.documentCount} documents, ${context.customerCount} customers`;
    }

    return `I'm SmartLedger Assistant for ${context.businessName}. Your health score is ${context.healthScore}/100 (${context.creditReadinessLabel}) with ${context.netProfit.toLocaleString()} ${context.currency} net profit. Ask me about loan readiness, improving your score, debts, or your business summary. (Note: Configure ANTHROPIC_API_KEY or OPENAI_API_KEY for full AI responses.)`;
  }
}

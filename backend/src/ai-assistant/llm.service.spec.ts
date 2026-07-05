import { LlmService } from './llm.service';
import { BusinessContextSnapshot } from './dto/chat.dto';

describe('LlmService fallback', () => {
  const service = new LlmService({
    get: () => '',
  } as never);

  const context: BusinessContextSnapshot = {
    businessName: 'Kigali Fresh Market',
    passportId: 'SL-TEST1234',
    healthScore: 52,
    creditReadiness: 'medium',
    creditReadinessLabel: 'Near Ready',
    totalRevenue: 5000000,
    totalExpenses: 3000000,
    netProfit: 2000000,
    outstandingDebts: 150000,
    transactionCount: 15,
    documentCount: 2,
    customerCount: 2,
    debtCount: 3,
    paidDebtCount: 1,
    currency: 'RWF',
  };

  it('answers loan readiness in English', () => {
    const reply = service.generateFallbackReply('Am I ready for a loan?', context, 'en');
    expect(reply).toContain('52');
    expect(reply.toLowerCase()).toMatch(/loan|score|credit/);
  });

  it('answers in Kinyarwanda when requested', () => {
    const reply = service.generateFallbackReply('Ese nditeguye gufata inguzanyo?', context, 'rw');
    expect(reply).toContain('52');
  });

  it('provides business summary', () => {
    const reply = service.generateFallbackReply('Summarize my business', context, 'en');
    expect(reply).toContain('Kigali Fresh Market');
    expect(reply).toContain('5,000,000');
  });
});

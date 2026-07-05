import { buildImprovementChecklist } from './dto/passport.dto';

describe('buildImprovementChecklist', () => {
  it('marks all items complete when thresholds are met', () => {
    const checklist = buildImprovementChecklist({
      transactionCount: 25,
      documentCount: 5,
      customerCount: 4,
      resolvedDebtRatio: 0.6,
    });

    expect(checklist.every((item) => item.completed)).toBe(true);
  });

  it('marks debt item incomplete below 50% resolved', () => {
    const checklist = buildImprovementChecklist({
      transactionCount: 25,
      documentCount: 5,
      customerCount: 4,
      resolvedDebtRatio: 0.3,
    });

    const debtItem = checklist.find((i) => i.id === 'debts_50pct');
    expect(debtItem?.completed).toBe(false);
  });

  it('marks transaction items based on count', () => {
    const checklist = buildImprovementChecklist({
      transactionCount: 15,
      documentCount: 0,
      customerCount: 0,
      resolvedDebtRatio: 0,
    });

    expect(checklist.find((i) => i.id === 'transactions_10')?.completed).toBe(true);
    expect(checklist.find((i) => i.id === 'transactions_20')?.completed).toBe(false);
  });
});

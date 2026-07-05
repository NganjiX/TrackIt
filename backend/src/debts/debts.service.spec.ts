import { computeDebtStatus } from './debts.service';
import { DebtStatus } from '@prisma/client';

describe('computeDebtStatus', () => {
  const futureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  };

  const pastDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  };

  it('returns paid when paidAmount >= amount', () => {
    expect(computeDebtStatus(100000, 100000, pastDate())).toBe(DebtStatus.paid);
    expect(computeDebtStatus(100000, 120000, pastDate())).toBe(DebtStatus.paid);
  });

  it('returns pending for unpaid future debt', () => {
    expect(computeDebtStatus(100000, 0, futureDate())).toBe(DebtStatus.pending);
  });

  it('returns partial for partially paid future debt', () => {
    expect(computeDebtStatus(100000, 50000, futureDate())).toBe(DebtStatus.partial);
  });

  it('returns overdue for unpaid past debt', () => {
    expect(computeDebtStatus(100000, 0, pastDate())).toBe(DebtStatus.overdue);
  });

  it('returns overdue for partially paid past debt', () => {
    expect(computeDebtStatus(100000, 50000, pastDate())).toBe(DebtStatus.overdue);
  });
});

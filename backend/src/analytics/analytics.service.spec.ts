import { resolveAnalyticsDateRange, buildMonthKeys, toMonthKey } from './dto/analytics-query.dto';

describe('analytics date helpers', () => {
  it('builds month keys across a range', () => {
    const start = new Date('2026-01-15');
    const end = new Date('2026-03-10');
    expect(buildMonthKeys(start, end)).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('formats month key', () => {
    expect(toMonthKey(new Date('2026-07-05'))).toBe('2026-07');
  });

  it('resolves year period as 12 months back', () => {
    const { start } = resolveAnalyticsDateRange('year', undefined, '2026-06-15');
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(5);
  });
});
